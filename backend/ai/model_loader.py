import os
import traceback
from tensorflow.keras.models import load_model

def load_prediction_model():
    """Load the Keras prediction model"""
    model_dir = os.path.join(os.path.dirname(__file__), '..', 'model')
    possible_paths = [
        os.path.join(model_dir, 'ml.keras'),
        os.path.join(os.path.dirname(__file__), '..', 'ml.keras')
    ]
    for model_path in possible_paths:
        try:
            if os.path.exists(model_path):
                print(f"Loading model from: {model_path}")
                model = load_model(model_path, compile=False)
                print("Successfully loaded Keras model")
                return model
        except Exception as e:
            print(f"Error loading model from {model_path}: {e}")
            traceback.print_exc()
            continue
    raise ValueError("Could not load the prediction model from any specified path")