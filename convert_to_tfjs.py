"""
V-Sign AI - Model Converter
Convert trained Keras model to TensorFlow.js format
"""

import sys
from unittest.mock import MagicMock

# --- FIX LỖI TƯƠNG THÍCH TRÊN WINDOWS & JAX ---
# 1. Chặn lỗi Bad Image từ tensorflow_decision_forests
sys.modules["tensorflow_decision_forests"] = MagicMock()
sys.modules["tensorflow_decision_forests.keras"] = MagicMock()

# 2. Chặn lỗi ImportError từ JAX (Lỗi bạn vừa gặp)
mock_jax = MagicMock()
sys.modules["jax"] = mock_jax
sys.modules["jax.experimental"] = MagicMock()
sys.modules["jax.experimental.jax2tf"] = MagicMock()
# ----------------------------------------------

import tensorflowjs as tfjs
from tensorflow import keras
import json
import os

# ... (Giữ nguyên phần còn lại của file convert_to_tfjs.py) ...

# Gesture labels
GESTURES = ['Đau', 'Bác sĩ', 'Cần giúp', 'Thuốc', 'Cảm ơn']

def convert_to_tfjs(model_path='best_model.h5', output_dir='tfjs_model'):
    """
    Convert Keras model to TensorFlow.js format
    
    Args:
        model_path: Path to the trained Keras model (.h5 file)
        output_dir: Directory to save the converted model
    """
    print("="*60)
    print(" "*15 + "V-SIGN AI - MODEL CONVERTER")
    print("="*60)
    
    # Check if model exists
    if not os.path.exists(model_path):
        print(f"\nERROR: Model file '{model_path}' not found!")
        print("Please train the model first using train_model.py")
        return
    
    # Load model
    print(f"\nLoading model from '{model_path}'...")
    model = keras.models.load_model(model_path)
    print("✓ Model loaded successfully")
    
    # Display model summary
    print("\nModel Summary:")
    model.summary()
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert to TensorFlow.js
    print(f"\nConverting model to TensorFlow.js format...")
    print(f"Output directory: {output_dir}")
    
    tfjs.converters.save_keras_model(
        model,
        output_dir,
        quantization_dtype_map={
            'uint8': '*',  # Quantize all weights to uint8 for smaller size
        }
    )
    
    print("✓ Model converted successfully!")
    
    # List generated files
    print("\nGenerated files:")
    for filename in os.listdir(output_dir):
        filepath = os.path.join(output_dir, filename)
        size = os.path.getsize(filepath)
        
        # Format file size
        if size < 1024:
            size_str = f"{size} B"
        elif size < 1024 * 1024:
            size_str = f"{size / 1024:.2f} KB"
        else:
            size_str = f"{size / (1024 * 1024):.2f} MB"
        
        print(f"  - {filename} ({size_str})")
    
    # Create label mapping
    label_map = {i: gesture for i, gesture in enumerate(GESTURES)}
    
    labels_path = os.path.join(output_dir, 'labels.json')
    with open(labels_path, 'w', encoding='utf-8') as f:
        json.dump(label_map, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Label mapping saved to '{labels_path}'")
    
    # Create metadata
    metadata = {
        'model_name': 'V-Sign AI',
        'version': '1.0.0',
        'description': 'Vietnamese Sign Language Recognition Model',
        'gestures': GESTURES,
        'num_classes': len(GESTURES),
        'sequence_length': 30,
        'num_landmarks': 21,
        'input_shape': [30, 63],
        'framework': 'TensorFlow.js',
        'license': 'MIT'
    }
    
    metadata_path = os.path.join(output_dir, 'metadata.json')
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Metadata saved to '{metadata_path}'")
    
    # Print usage instructions
    print("\n" + "="*60)
    print("USAGE INSTRUCTIONS")
    print("="*60)
    print("\n1. Copy the entire 'tfjs_model' folder to your React project's public directory:")
    print("   public/tfjs_model/")
    print("\n2. Load the model in your React app:")
    print("   const model = await tf.loadLayersModel('/tfjs_model/model.json');")
    print("\n3. Make predictions:")
    print("   const predictions = model.predict(inputTensor);")
    print("\n" + "="*60)

def convert_without_quantization(model_path='best_model.h5', output_dir='tfjs_model_full'):
    """
    Convert without quantization for maximum accuracy
    (Results in larger file size but potentially better performance)
    """
    print("\nConverting WITHOUT quantization...")
    
    model = keras.models.load_model(model_path)
    os.makedirs(output_dir, exist_ok=True)
    
    tfjs.converters.save_keras_model(model, output_dir)
    
    print(f"✓ Full precision model saved to '{output_dir}'")

if __name__ == '__main__':
    # Convert with quantization (recommended for web deployment)
    convert_to_tfjs('best_model.h5', 'tfjs_model')
    
    # Optionally convert without quantization
    # Uncomment the line below if you need full precision
    # convert_without_quantization('best_model.h5', 'tfjs_model_full')
