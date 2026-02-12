"""
V-Sign AI - Training Script
Train LSTM model for Vietnamese Sign Language Recognition
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import json
import os
import matplotlib.pyplot as plt
import seaborn as sns

# ===== CONFIGURATION =====
SEQUENCE_LENGTH = 30  # 30 frames per sequence
NUM_LANDMARKS = 21    # MediaPipe Hands provides 21 landmarks
COORDINATES = 3       # x, y, z coordinates
NUM_CLASSES = 5       # 5 medical gestures

GESTURES = ['Đau', 'Bác_sĩ', 'Cần_giúp', 'Thuốc', 'Cảm_ơn']

# ===== DATA LOADING =====
def load_dataset(data_dir='dataset'):
    """
    Load dataset from directory structure:
    dataset/
    ├── Đau/
    │   ├── person1_seq001.json
    │   ├── person1_seq002.json
    │   └── ...
    ├── Bác_sĩ/
    └── ...
    
    Each JSON file structure:
    {
        "gesture": "Đau",
        "sequences": [
            {
                "frames": [
                    {
                        "landmarks": [
                            {"x": 0.5, "y": 0.3, "z": -0.02},
                            ...  # 21 landmarks total
                        ]
                    }
                    ...  # 30 frames total
                ]
            }
        ]
    }
    """
    X = []  # Features
    y = []  # Labels
    
    print("Loading dataset...")
    
    for label_idx, gesture in enumerate(GESTURES):
        gesture_path = os.path.join(data_dir, gesture)
        
        if not os.path.exists(gesture_path):
            print(f"Warning: {gesture_path} not found. Skipping...")
            continue
        
        file_count = 0
        for filename in os.listdir(gesture_path):
            if filename.endswith('.json'):
                try:
                    with open(os.path.join(gesture_path, filename), 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                        # Process all sequences in the file
                        for sequence in data['sequences']:
                            frames_data = []
                            
                            # Extract landmarks from each frame
                            for frame in sequence['frames']:
                                landmarks = np.array([
                                    [lm['x'], lm['y'], lm['z']] 
                                    for lm in frame['landmarks']
                                ])
                                frames_data.append(landmarks.flatten())  # Shape: (63,)
                            
                            # Ensure we have exactly 30 frames
                            if len(frames_data) == SEQUENCE_LENGTH:
                                X.append(frames_data)
                                y.append(label_idx)
                                file_count += 1
                            else:
                                print(f"Warning: {filename} has {len(frames_data)} frames, expected {SEQUENCE_LENGTH}")
                
                except Exception as e:
                    print(f"Error loading {filename}: {e}")
        
        print(f"  {gesture}: {file_count} sequences loaded")
    
    return np.array(X), np.array(y)

# ===== DATA AUGMENTATION =====
def augment_sequence(sequence):
    """
    Apply data augmentation to a single sequence
    - Random rotation
    - Random scaling
    - Adding Gaussian noise
    """
    augmented = sequence.copy()
    
    # Random scaling (0.9 - 1.1)
    scale = np.random.uniform(0.9, 1.1)
    augmented *= scale
    
    # Random noise
    noise = np.random.normal(0, 0.01, augmented.shape)
    augmented += noise
    
    # Random rotation (simplified - just for x,y coordinates)
    angle = np.random.uniform(-15, 15) * np.pi / 180
    cos_angle, sin_angle = np.cos(angle), np.sin(angle)
    
    for frame_idx in range(len(augmented)):
        for landmark_idx in range(NUM_LANDMARKS):
            x_idx = landmark_idx * 3
            y_idx = landmark_idx * 3 + 1
            
            x = augmented[frame_idx, x_idx]
            y = augmented[frame_idx, y_idx]
            
            augmented[frame_idx, x_idx] = x * cos_angle - y * sin_angle
            augmented[frame_idx, y_idx] = x * sin_angle + y * cos_angle
    
    return augmented

def augment_dataset(X, y, augmentation_factor=2):
    """
    Augment the entire dataset
    """
    X_augmented = []
    y_augmented = []
    
    print(f"\nAugmenting dataset (factor={augmentation_factor})...")
    
    for i in range(len(X)):
        # Keep original
        X_augmented.append(X[i])
        y_augmented.append(y[i])
        
        # Add augmented versions
        for _ in range(augmentation_factor - 1):
            X_augmented.append(augment_sequence(X[i]))
            y_augmented.append(y[i])
    
    return np.array(X_augmented), np.array(y_augmented)

# ===== MODEL ARCHITECTURE =====
def create_model(input_shape=(SEQUENCE_LENGTH, NUM_LANDMARKS * COORDINATES)):
    """
    Create LSTM model for gesture recognition
    
    Architecture:
    - LSTM Layer 1: 128 units with return sequences
    - Dropout: 0.3
    - LSTM Layer 2: 64 units
    - Dropout: 0.3
    - Dense: 64 units (ReLU)
    - Dropout: 0.2
    - Output: NUM_CLASSES units (Softmax)
    """
    model = Sequential([
        # First LSTM layer
        LSTM(128, return_sequences=True, activation='relu', 
             input_shape=input_shape, name='lstm_1'),
        BatchNormalization(),
        Dropout(0.3),
        
        # Second LSTM layer
        LSTM(64, return_sequences=False, activation='relu', name='lstm_2'),
        BatchNormalization(),
        Dropout(0.3),
        
        # Dense layers
        Dense(64, activation='relu', name='dense_1'),
        Dropout(0.2),
        
        # Output layer
        Dense(NUM_CLASSES, activation='softmax', name='output')
    ], name='VSIgn_LSTM')
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# ===== TRAINING =====
def train_model(X_train, y_train, X_val, y_val):
    """
    Train the model with callbacks
    """
    # Create model
    model = create_model()
    model.summary()
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=20,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=7,
            min_lr=1e-7,
            verbose=1
        ),
        keras.callbacks.ModelCheckpoint(
            'best_model.h5',
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        keras.callbacks.TensorBoard(
            log_dir='logs',
            histogram_freq=1
        )
    ]
    
    # Training
    print("\n" + "="*50)
    print("Starting Training...")
    print("="*50)
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=100,
        batch_size=32,
        callbacks=callbacks,
        verbose=1
    )
    
    return model, history

# ===== EVALUATION =====
def evaluate_model(model, X_test, y_test):
    """
    Evaluate model performance
    """
    print("\n" + "="*50)
    print("Evaluating Model...")
    print("="*50)
    
    # Get predictions
    y_pred_probs = model.predict(X_test)
    y_pred = np.argmax(y_pred_probs, axis=1)
    
    # Calculate accuracy
    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=GESTURES))
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\nConfusion Matrix:")
    print(cm)
    
    # Plot confusion matrix
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=GESTURES, yticklabels=GESTURES)
    plt.title('Confusion Matrix - V-Sign AI')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("Confusion matrix saved to 'confusion_matrix.png'")
    
    return y_pred, y_pred_probs

# ===== PLOT TRAINING HISTORY =====
def plot_history(history):
    """
    Plot training history
    """
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Accuracy
    axes[0].plot(history.history['accuracy'], label='Train Accuracy')
    axes[0].plot(history.history['val_accuracy'], label='Val Accuracy')
    axes[0].set_title('Model Accuracy')
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Accuracy')
    axes[0].legend()
    axes[0].grid(True)
    
    # Loss
    axes[1].plot(history.history['loss'], label='Train Loss')
    axes[1].plot(history.history['val_loss'], label='Val Loss')
    axes[1].set_title('Model Loss')
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Loss')
    axes[1].legend()
    axes[1].grid(True)
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
    print("Training history saved to 'training_history.png'")

# ===== MAIN =====
def main():
    """
    Main training pipeline
    """
    print("\n" + "="*60)
    print(" "*15 + "V-SIGN AI - TRAINING PIPELINE")
    print("="*60 + "\n")
    
    # 1. Load dataset
    X, y = load_dataset('dataset')
    
    if len(X) == 0:
        print("\nERROR: No data loaded. Please check your dataset directory.")
        print("Expected structure:")
        print("dataset/")
        print("├── Đau/")
        print("│   ├── person1_seq001.json")
        print("│   └── ...")
        print("├── Bác_sĩ/")
        print("└── ...")
        return
    
    print(f"\nDataset loaded: {len(X)} sequences")
    print(f"Shape: X={X.shape}, y={y.shape}")
    
    # 2. Augment dataset (optional - comment out if you have enough data)
    # X, y = augment_dataset(X, y, augmentation_factor=3)
    # print(f"After augmentation: {len(X)} sequences")
    
    # 3. Split dataset
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    print(f"\nDataset split:")
    print(f"  Train: {len(X_train)} sequences")
    print(f"  Val:   {len(X_val)} sequences")
    print(f"  Test:  {len(X_test)} sequences")
    
    # 4. Train model
    model, history = train_model(X_train, y_train, X_val, y_val)
    
    # 5. Plot training history
    plot_history(history)
    
    # 6. Evaluate on test set
    y_pred, y_pred_probs = evaluate_model(model, X_test, y_test)
    
    # 7. Save final model
    model.save('vsign_model_final.h5')
    print("\n✓ Final model saved as 'vsign_model_final.h5'")
    
    # 8. Save training info
    training_info = {
        'gestures': GESTURES,
        'num_classes': NUM_CLASSES,
        'sequence_length': SEQUENCE_LENGTH,
        'num_landmarks': NUM_LANDMARKS,
        'total_samples': len(X),
        'train_samples': len(X_train),
        'val_samples': len(X_val),
        'test_samples': len(X_test),
        'final_accuracy': float(history.history['val_accuracy'][-1]),
        'final_loss': float(history.history['val_loss'][-1])
    }
    
    with open('training_info.json', 'w', encoding='utf-8') as f:
        json.dump(training_info, f, indent=2, ensure_ascii=False)
    
    print("✓ Training info saved as 'training_info.json'")
    
    print("\n" + "="*60)
    print("Training completed successfully!")
    print("="*60)

if __name__ == '__main__':
    main()
