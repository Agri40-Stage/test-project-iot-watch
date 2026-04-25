import { API_BASE_URL } from '../config';

export const queryAssistant = async (question) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || 'Erreur lors de l’appel à l’assistant.' };
    }
    return data;
  } catch (error) {
    console.error('Error querying assistant:', error);
    return { error: 'Impossible de joindre l’assistant pour le moment.' };
  }
};
