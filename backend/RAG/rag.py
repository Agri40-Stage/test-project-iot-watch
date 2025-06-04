import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF
import faiss
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import requests
import google.generativeai as genai
from langchain.schema import Document
from langchain_community.vectorstores import FAISS

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_MODEL_URL = os.getenv("GOOGLE_MODEL_URL")

app = Flask(__name__)
CORS(app)

# Systeme de mémoire  (un tableau simple)
conversation_memory = []
#rappeler seulemement- les tris récent conversation
MAX_MEMORY_LENGTH = 3  

# fait appel a google gemini(version gratuite 2.0 )
genai.configure(api_key=API_KEY )

# processer les pdf 
def load_agriculture_documents(pdf_paths, chunk_size=500, overlap=50):
    all_chunks = []
    for pdf_path in pdf_paths:
        try:
            doc = fitz.open(pdf_path)
            full_text = ""
            for page in doc:
                full_text += page.get_text()
            
            # Chunk the text
            start = 0
            while start < len(full_text):
                end = min(start + chunk_size, len(full_text))
                chunk = full_text[start:end]
                all_chunks.append(chunk.strip())
                start += chunk_size - overlap
        except Exception as e:
            print(f"Error loading {pdf_path}: {str(e)}")
    return all_chunks

# les documents utilisé (seulementy ub prototype    __il faut bien chercher est structurer une document qui contien les information nécessaire
agriculture_pdfs = [
    "moroccan_agriculture_guide.pdf",
    "agro_climate_zones.pdf",
    "crop_techniques.pdf"
]
agriculture_chunks = load_agriculture_documents(agriculture_pdfs)
docs = [Document(page_content=chunk) for chunk in agriculture_chunks]

# le database vectorielle pour stocker les document vectoriser
texts = [doc.page_content for doc in docs]
vectorizer = TfidfVectorizer()
vectors = vectorizer.fit_transform(texts).toarray().astype('float32')

index = faiss.IndexFlatL2(vectors.shape[1])
index.add(vectors)

faiss_store = FAISS(
    embedding_function=None,
    index=index,
    docstore=docs,
    index_to_docstore_id=lambda i: str(i)
)

# pour retriver les information relevent d'un question poser par l'utilisateur
def retrieve(query, vectorizer, faiss_store, k=3):
    query_vector = vectorizer.transform([query]).toarray().astype('float32')
    _, indices = faiss_store.index.search(query_vector, k)
    return [faiss_store.docstore[i] for i in indices[0]]

def is_follow_up(query):
    query = query.lower().strip()
    return any(query.startswith(word) for word in ['and', 'but', 'however', 'what about', 'also', '...', 'what'])

def generate_response(query, relevant_docs):
    context = "\n".join([doc.page_content for doc in relevant_docs])
    
    # inclure l'historique de conversation si précis
    if conversation_memory:
        memory_context = "\nPrevious conversation:\n" + "\n".join(
            f"Q: {item['question']}\nA: {item['answer']}" 
            for item in conversation_memory
        )
        context = memory_context + "\n\nDocument context:\n" + context
        #prompet qui peut étre améliorer (j'ai spécifier le repondre explicitement de repondre au certain message comme hello et hy  . car il il donne  le context  , ce qui est unnécessaire)
    
    prompt = f"""
You are an expert AI assistant specializing in Moroccan agriculture. Provide detailed, 
accurate information focusing on local conditions, crops, techniques, and regulations.
If the user’s input is just a greeting (e.g., “hello,” “hi,”,"hy",“good morning”), respond politely with a brief greeting and do not provide any contextual information until the user asks a clear question.

For all other

{context}

User Question: {query}

Respond with:
1. Specific information relevant to Morocco
2. Practical recommendations
3. Keep answers under 150 words
"""
    url = f"{GOOGLE_MODEL_URL}:generateContent?key={API_KEY}"

    headers = { "Content-Type": "application/json" }
    body = { "contents": [ { "parts": [ { "text": prompt } ] } ] }
    
    try:
        response = requests.post(url, headers=headers, json=body)
        response.raise_for_status()
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"⚠️ Error generating response: {str(e)}"

# A
@app.route('/api/agriculture-query', methods=['POST'])
def agriculture_query():
    
    global conversation_memory
    
    data = request.get_json()
    user_query = data.get('query')
    
    if not user_query:
        return jsonify({'error': 'No query provided'}), 400
    
    # améliorer l'inpt avec un logique de (context precidente)
    if is_follow_up(user_query) and conversation_memory:
        last_qa = conversation_memory[-1]
        enhanced_query = f"Context: {last_qa['answer']}\nQuestion: {user_query}"
    else:
        enhanced_query = user_query
    
    relevant_docs = retrieve(enhanced_query, vectorizer, faiss_store)
    answer = generate_response(user_query, relevant_docs)
    
    # mise a jour du tableau
    conversation_memory.append({
        'question': user_query,
        'answer': answer,
        'sources': [doc.page_content[:100] + "..." for doc in relevant_docs]
    })
    conversation_memory = conversation_memory[-MAX_MEMORY_LENGTH:]
    
    return jsonify({
        'response': answer,
        'sources': [doc.page_content[:100] + "..." for doc in relevant_docs]
    })

if __name__ == '__main__':
    app.run(port=2000) 

