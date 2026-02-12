"""
V-Sign AI - Sample Data Generator
Generate synthetic sample data for testing purposes
This is for demonstration only - replace with real data collection
"""

import numpy as np
import json
import os
from pathlib import Path

# Gesture configurations
GESTURES = ['Đau', 'Bác_sĩ', 'Cần_giúp', 'Thuốc', 'Cảm_ơn']
SEQUENCE_LENGTH = 30
NUM_LANDMARKS = 21
SAMPLES_PER_GESTURE = 50  # Generate 50 samples per gesture

def generate_gesture_pattern(gesture_name, sample_idx):
    """
    Generate a synthetic gesture pattern
    In real application, replace this with actual MediaPipe landmark data
    
    Each gesture has different movement characteristics:
    - Đau: Hand moving to body (decreasing x)
    - Bác sĩ: Cross-like pattern
    - Cần giúp: Hands up (high y values)
    - Thuốc: Hand to mouth motion
    - Cảm ơn: Hand forward motion
    """
    frames = []
    
    for frame_idx in range(SEQUENCE_LENGTH):
        landmarks = []
        
        # Base position with some variation
        base_x = 0.5 + np.random.normal(0, 0.05)
        base_y = 0.5 + np.random.normal(0, 0.05)
        base_z = 0.0
        
        # Gesture-specific movements
        if gesture_name == 'Đau':
            # Hand moving toward body
            progress = frame_idx / SEQUENCE_LENGTH
            base_x -= progress * 0.2
            base_y += np.sin(progress * np.pi) * 0.1
        
        elif gesture_name == 'Bác_sĩ':
            # Cross pattern
            progress = frame_idx / SEQUENCE_LENGTH
            if progress < 0.5:
                base_y += progress * 0.3
            else:
                base_x += (progress - 0.5) * 0.3
        
        elif gesture_name == 'Cần_giúp':
            # Hands up
            progress = frame_idx / SEQUENCE_LENGTH
            base_y -= progress * 0.3
            base_x += np.sin(progress * 2 * np.pi) * 0.05
        
        elif gesture_name == 'Thuốc':
            # Hand to mouth
            progress = frame_idx / SEQUENCE_LENGTH
            base_y -= progress * 0.2
            base_x += progress * 0.1
            base_z -= progress * 0.05
        
        elif gesture_name == 'Cảm_ơn':
            # Hand forward
            progress = frame_idx / SEQUENCE_LENGTH
            base_z += progress * 0.15
            base_y -= progress * 0.1
        
        # Generate 21 landmarks with hand structure
        for landmark_idx in range(NUM_LANDMARKS):
            # Simplified hand structure
            if landmark_idx == 0:  # Wrist
                x, y, z = base_x, base_y, base_z
            elif 1 <= landmark_idx <= 4:  # Thumb
                offset = (landmark_idx - 1) * 0.02
                x = base_x - 0.05 + offset
                y = base_y + 0.02
                z = base_z
            elif 5 <= landmark_idx <= 8:  # Index finger
                offset = (landmark_idx - 5) * 0.025
                x = base_x - 0.02
                y = base_y - offset
                z = base_z
            elif 9 <= landmark_idx <= 12:  # Middle finger
                offset = (landmark_idx - 9) * 0.025
                x = base_x
                y = base_y - offset
                z = base_z
            elif 13 <= landmark_idx <= 16:  # Ring finger
                offset = (landmark_idx - 13) * 0.025
                x = base_x + 0.02
                y = base_y - offset
                z = base_z
            else:  # Pinky (17-20)
                offset = (landmark_idx - 17) * 0.025
                x = base_x + 0.04
                y = base_y - offset
                z = base_z
            
            # Add small random noise
            x += np.random.normal(0, 0.005)
            y += np.random.normal(0, 0.005)
            z += np.random.normal(0, 0.003)
            
            landmarks.append({
                'x': float(x),
                'y': float(y),
                'z': float(z)
            })
        
        frames.append({
            'landmarks': landmarks
        })
    
    return frames

def generate_dataset(output_dir='dataset'):
    """
    Generate sample dataset for all gestures
    """
    print("="*60)
    print(" "*15 + "V-SIGN AI - DATA GENERATOR")
    print("="*60)
    print(f"\nGenerating {SAMPLES_PER_GESTURE} samples per gesture...")
    print(f"Total samples: {SAMPLES_PER_GESTURE * len(GESTURES)}")
    
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    for gesture in GESTURES:
        print(f"\nGenerating '{gesture}'...")
        
        # Create gesture directory
        gesture_dir = os.path.join(output_dir, gesture)
        Path(gesture_dir).mkdir(parents=True, exist_ok=True)
        
        # Generate samples
        for sample_idx in range(SAMPLES_PER_GESTURE):
            # Generate person ID and sequence ID
            person_id = (sample_idx // 10) + 1  # 10 samples per person
            seq_id = (sample_idx % 10) + 1
            
            # Generate gesture data
            frames = generate_gesture_pattern(gesture, sample_idx)
            
            # Create data structure
            data = {
                'gesture': gesture,
                'person_id': f'person{person_id}',
                'sequences': [
                    {
                        'frames': frames,
                        'duration_ms': 1000
                    }
                ]
            }
            
            # Save to file
            filename = f'person{person_id}_seq{seq_id:03d}.json'
            filepath = os.path.join(gesture_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            if (sample_idx + 1) % 10 == 0:
                print(f"  ✓ {sample_idx + 1}/{SAMPLES_PER_GESTURE} samples generated")
    
    print("\n" + "="*60)
    print("Dataset generation completed!")
    print("="*60)
    print(f"\nDataset saved to: {output_dir}/")
    print("\nDirectory structure:")
    print(f"{output_dir}/")
    for gesture in GESTURES:
        print(f"├── {gesture}/")
        print(f"│   ├── person1_seq001.json")
        print(f"│   ├── person1_seq002.json")
        print(f"│   └── ... ({SAMPLES_PER_GESTURE} files)")
    
    print("\n⚠️  NOTE: This is SYNTHETIC data for testing only!")
    print("For production, collect real data using MediaPipe Hands")
    print("="*60)

def generate_data_collection_template():
    """
    Generate a template for real data collection
    """
    template = {
        'gesture': 'YOUR_GESTURE_NAME',
        'person_id': 'person1',
        'sequences': [
            {
                'frames': [
                    {
                        'landmarks': [
                            {'x': 0.0, 'y': 0.0, 'z': 0.0}  # Repeat 21 times
                            # ... Add 20 more landmarks
                        ]
                    }
                    # ... Add 29 more frames (total 30)
                ],
                'duration_ms': 1000
            }
        ]
    }
    
    with open('data_collection_template.json', 'w', encoding='utf-8') as f:
        json.dump(template, f, ensure_ascii=False, indent=2)
    
    print("\n✓ Data collection template saved to 'data_collection_template.json'")

if __name__ == '__main__':
    # Generate sample dataset
    generate_dataset('dataset')
    
    # Generate template for real data collection
    generate_data_collection_template()
