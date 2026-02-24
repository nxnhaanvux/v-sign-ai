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
NUM_LANDMARKS = 42
SAMPLES_PER_GESTURE = 50  # Generate 50 samples per gesture

def generate_gesture_pattern(gesture_name, sample_idx):
    """
    Sinh dữ liệu giả lập cho ký hiệu 1 tay và 2 tay (42 landmarks total).
    Hand 1: landmarks 0-20
    Hand 2: landmarks 21-41
    """
    frames = []
    
    for frame_idx in range(SEQUENCE_LENGTH):
        landmarks = []
        progress = frame_idx / SEQUENCE_LENGTH
        
        # --- Khởi tạo vị trí gốc cho 2 tay ---
        # Tay 1 (thường nằm bên trái khung hình)
        h1_base = [0.3, 0.5, 0.0] 
        # Tay 2 (thường nằm bên phải khung hình)
        h2_base = [0.7, 0.5, 0.0]
        
        # --- Định nghĩa quỹ đạo di chuyển (Trajectory) ---
        if gesture_name == 'Đau':
            # 1 Tay: Di chuyển tay 1 về phía cơ thể, Tay 2 triệt tiêu
            h1_base[0] += progress * 0.2  # Di chuyển x
            h1_base[1] += np.sin(progress * np.pi) * 0.1 # Chuyển động cong
            h2_base = [0.0, 0.0, 0.0] # Không sử dụng tay 2

        elif gesture_name == 'Bác_sĩ':
            # 2 Tay: Tay 1 chạm vào cổ tay 2
            h1_base = [0.5 + (1-progress)*0.2, 0.6, 0.0]
            h2_base = [0.5, 0.7, 0.0]

        elif gesture_name == 'Cần_giúp':
            # 2 Tay: Cùng đưa lên cao
            h1_base[1] -= progress * 0.3
            h2_base[1] -= progress * 0.3
            h1_base[0] += np.sin(progress * 2 * np.pi) * 0.05
            h2_base[0] -= np.sin(progress * 2 * np.pi) * 0.05

        elif gesture_name == 'Thuốc':
            # 1 Tay: Đưa tay lên miệng
            h1_base[1] -= progress * 0.3
            h1_base[0] = 0.5 
            h2_base = [0.0, 0.0, 0.0]

        elif gesture_name == 'Cảm_ơn':
            # 1 Tay: Đưa tay từ cằm ra phía trước
            h1_base[2] -= progress * 0.4 # Di chuyển trục Z (về phía camera)
            h1_base[1] += progress * 0.1
            h2_base = [0.0, 0.0, 0.0]

        # --- Sinh chi tiết 42 landmarks dựa trên vị trí gốc ---
        for hand_idx in range(2):
            current_base = h1_base if hand_idx == 0 else h2_base
            
            # Nếu tay đó không hoạt động (tọa độ 0), điền 21 landmark 0
            if current_base == [0.0, 0.0, 0.0]:
                for _ in range(21):
                    landmarks.append({'x': 0.0, 'y': 0.0, 'z': 0.0})
                continue

            # Nếu tay có hoạt động, sinh cấu trúc bàn tay cơ bản
            for lm_idx in range(21):
                # Thêm nhiễu nhẹ để model học tốt hơn
                noise = np.random.normal(0, 0.005, 3)
                
                # Cấu trúc ngón tay giả lập đơn giản dựa trên lm_idx
                # (Wrist là 0, các ngón tay từ 1-20)
                offset_y = (lm_idx // 4) * 0.02 
                offset_x = (lm_idx % 4) * 0.01
                
                landmarks.append({
                    'x': float(current_base[0] + offset_x + noise[0]),
                    'y': float(current_base[1] - offset_y + noise[1]),
                    'z': float(current_base[2] + noise[2])
                })
        
        frames.append({'landmarks': landmarks})
        
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
