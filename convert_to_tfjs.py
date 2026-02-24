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
mock_jax = MagicMock()
sys.modules["jax"] = mock_jax
sys.modules["jax.experimental"] = MagicMock()
sys.modules["jax.experimental.jax2tf"] = MagicMock()
# ----------------------------------------------

import tensorflowjs as tfjs
from tensorflow import keras
import json
import os

# ... (Giữ nguyên phần còn lại của fil  e convert_to_tfjs.py) ...

# Gesture labels
GESTURES = ['Đau', 'Bác_sĩ', 'Cần_giúp', 'Thuốc', 'Cảm_ơn']

def convert_to_tfjs(model_path='vsign_model_final.h5', output_dir='tfjs_model'):
    """
    Convert Keras model to TensorFlow.js format
    
    Args:
        model_path: Path to the trained Keras model (.h5 file)
        output_dir: Directory to save the converted model
    """
    print("="*60)
    print(" " * 15 + "V-SIGN AI - MODEL CONVERTER")
    print("="*60)
    
    # Check if model exists
    if not os.path.exists(model_path):
        print(f"\nERROR: File '{model_path}' không tồn tại!")
        print("Vui lòng chạy train_model.py trước.")
        return
    
    # Load model
    print(f"\nĐang tải model từ '{model_path}'...")
    model = keras.models.load_model(model_path)

    input_shape = model.input_shape # (None, 30, 126)
    print(f"✓ Model loaded. Input shape: {input_shape}")
    
    # Display model summary
    print("\nModel Summary:")
    model.summary()
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert to TensorFlow.js
    print(f"\nĐang chuyển đổi sang định dạng TensorFlow.js...")
    
    tfjs.converters.save_keras_model(
        model,
        output_dir,
        quantization_dtype_map={'uint8': '*'} 
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
    label_map = {str(i): gesture for i, gesture in enumerate(GESTURES)}
    labels_path = os.path.join(output_dir, 'labels.json')
    with open(labels_path, 'w', encoding='utf-8') as f:
        json.dump(label_map, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ Label mapping saved to '{labels_path}'")
    
    # Create metadata
    metadata = {
        'model_name': 'V-Sign AI (2-Hands Support)',
        'version': '1.1.0',
        'gestures': GESTURES,
        'num_classes': len(GESTURES),
        'sequence_length': 30,
        'num_landmarks': 42,      # 21 * 2
        'input_shape': [30, 126], # 42 * 3
        'format': 'layers_model',
        'quantized': True
    }
    
    metadata_path = os.path.join(output_dir, 'metadata.json')
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Đã tạo labels.json và metadata.json")
    print(f"✓ Lưu tại: {output_dir}/")
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
