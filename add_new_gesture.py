import os
import re
import json
from pathlib import Path

# Cấu hình đường dẫn
TRAIN_FILE = 'train_model.py'
CONVERT_FILE = 'convert_to_tfjs.py'
REACT_LABELS = 'react-app/public/tfjs_model/labels.json'

def get_gestures_from_train():
    """Lấy danh sách từ hiện tại trong train_model.py"""
    with open(TRAIN_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(r"GESTURES = \[(.*?)\]", content, re.DOTALL)
    if match:
        return [g.strip().strip("'\"") for g in match.group(1).split(',') if g.strip()]
    return []

def update_all_files(new_gestures):
    """Cập nhật đồng bộ 3 file: Train, Convert, Labels"""
    gesture_list_str = "[" + ", ".join([f"'{g}'" for g in new_gestures]) + "]"
    
    # 1. Cập nhật train_model.py
    with open(TRAIN_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r"GESTURES = \[.*?\]", f"GESTURES = {gesture_list_str}", content, flags=re.DOTALL)
    content = re.sub(r"NUM_CLASSES = \d+", f"NUM_CLASSES = {len(new_gestures)}", content)
    with open(TRAIN_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    # 2. Cập nhật convert_to_tfjs.py
    with open(CONVERT_FILE, 'r', encoding='utf-8') as f:
        c_content = f.read()
    c_content = re.sub(r"GESTURES = \[.*?\]", f"GESTURES = {gesture_list_str}", c_content, flags=re.DOTALL)
    with open(CONVERT_FILE, 'w', encoding='utf-8') as f:
        f.write(c_content)

    # 3. Cập nhật labels.json cho React (Đảm bảo Frontend tự cập nhật menu)
    label_map = {str(i): g for i, g in enumerate(new_gestures)}
    os.makedirs(os.path.dirname(REACT_LABELS), exist_ok=True)
    with open(REACT_LABELS, 'w', encoding='utf-8') as f:
        json.dump(label_map, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Đã cập nhật {len(new_gestures)} ký hiệu vào toàn bộ hệ thống!")

def main():
    print("--- V-Sign AI: Gesture Manager ---")
    current = get_gestures_from_train()
    print(f"Danh sách hiện tại: {', '.join(current)}")
    
    new_g = input("\nNhập tên ký hiệu mới muốn thêm (VD: Tam_biet): ").strip()
    if new_g and new_g not in current:
        current.append(new_g)
        # Tạo folder dataset tự động
        os.makedirs(f"dataset/{new_g}", exist_ok=True)
        update_all_files(current)
        print(f"📁 Đã tạo thư mục: dataset/{new_g}")
        print("🚀 Bây giờ bạn hãy dùng data_collector.html để thu thập dữ liệu và bỏ vào đó.")
    else:
        print("❌ Tên không hợp lệ hoặc đã tồn tại.")

if __name__ == "__main__":
    main()