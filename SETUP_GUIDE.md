# HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG V-SIGN AI

## MỤC LỤC
1. [Yêu cầu Hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Môi trường Python](#cài-đặt-môi-trường-python)
3. [Thu thập Dữ liệu](#thu-thập-dữ-liệu)
4. [Training Model](#training-model)
5. [Cài đặt Web App](#cài-đặt-web-app)
6. [Chạy Application](#chạy-application)
7. [Troubleshooting](#troubleshooting)

---

## YÊU CẦU HỆ THỐNG

### Phần cứng Tối thiểu
- **CPU**: Intel i5 hoặc tương đương
- **RAM**: 8GB (16GB recommended cho training)
- **GPU**: Không bắt buộc (nhưng sẽ tăng tốc độ training)
- **Webcam**: HD 720p trở lên
- **Storage**: 2GB trống

### Phần mềm
- **Python**: 3.8 - 3.11
- **Node.js**: 16.x trở lên
- **npm**: 8.x trở lên
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## CÀI ĐẶT MÔI TRƯỜNG PYTHON

### Bước 1: Tạo Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Bước 2: Cài đặt Dependencies

```bash
pip install -r requirements.txt
```

### Bước 3: Verify Installation

```bash
python -c "import tensorflow as tf; print(tf.__version__)"
# Expected output: 2.15.0
```

---

## THU THẬP DỮ LIỆU

### Option 1: Sử dụng Dữ liệu Mẫu (Quick Start)

```bash
python generate_sample_data.py
```

Lệnh này sẽ tạo **250 samples** (50 samples × 5 gestures) trong thư mục `dataset/`

⚠️ **Lưu ý**: Đây là dữ liệu SYNTHETIC chỉ để test. Để có kết quả tốt, bạn cần thu thập dữ liệu thực tế.

### Option 2: Thu thập Dữ liệu Thực tế

#### 2.1. Sử dụng MediaPipe + Python

```python
# Xem file example: collect_real_data.py
python collect_real_data.py --gesture "Đau" --samples 100
```

#### 2.2. Web-based Data Collection (Recommended)

1. Tạo một trang web đơn giản với MediaPipe Hands
2. Ghi lại landmarks khi người dùng thực hiện ký hiệu
3. Export ra JSON file theo format:

```json
{
  "gesture": "Đau",
  "sequences": [
    {
      "frames": [
        {
          "landmarks": [
            {"x": 0.5, "y": 0.3, "z": -0.02},
            // ... 20 landmarks nữa
          ]
        }
        // ... 29 frames nữa (tổng 30)
      ],
      "duration_ms": 1000
    }
  ]
}
```

### Cấu trúc Dữ liệu Chuẩn

```
dataset/
├── Đau/
│   ├── person1_seq001.json  (30 frames)
│   ├── person1_seq002.json
│   └── ... (100-500 files)
├── Bác_sĩ/
│   └── ... (100-500 files)
├── Cần_giúp/
│   └── ... (100-500 files)
├── Thuốc/
│   └── ... (100-500 files)
└── Cảm_ơn/
    └── ... (100-500 files)
```

### Checklist Thu thập Dữ liệu

- [ ] Ít nhất 100 samples/gesture (500+ recommended)
- [ ] Từ 5-10 người khác nhau
- [ ] Đa dạng về giới tính, độ tuổi
- [ ] Nhiều góc nhìn khác nhau
- [ ] Điều kiện ánh sáng khác nhau
- [ ] Tốc độ thực hiện khác nhau

---

## TRAINING MODEL

### Bước 1: Kiểm tra Dữ liệu

```bash
python train_model.py --check-only
```

### Bước 2: Train Model

```bash
python train_model.py
```

**Quá trình training**:
1. Load dataset từ `dataset/`
2. Split: 70% train, 15% validation, 15% test
3. Train LSTM model với early stopping
4. Save best model vào `best_model.h5`
5. Generate confusion matrix và training curves

**Output files**:
- `best_model.h5` - Model với accuracy cao nhất
- `vsign_model_final.h5` - Model cuối cùng
- `training_info.json` - Thông tin training
- `confusion_matrix.png` - Confusion matrix
- `training_history.png` - Training curves

### Bước 3: Đánh giá Model

```bash
python evaluate_model.py
```

Expected metrics:
- Training Accuracy: **95%+**
- Validation Accuracy: **90%+**
- Test Accuracy: **85-90%**

### Bước 4: Convert sang TensorFlow.js

```bash
python convert_to_tfjs.py
```

Output: `tfjs_model/`
- `model.json` (~50KB)
- `group1-shard1of1.bin` (~2-3MB)
- `labels.json` (label mapping)
- `metadata.json` (thông tin model)

---

## CÀI ĐẶT WEB APP

### Bước 1: Di chuyển vào thư mục React

```bash
cd react-app
```

### Bước 2: Cài đặt Node Dependencies

```bash
npm install
```

### Bước 3: Copy Model vào Public Folder

```bash
# Windows
xcopy /E /I ..\tfjs_model public\tfjs_model

# macOS/Linux
cp -r ../tfjs_model public/
```

### Bước 4: Verify Structure

```
react-app/
├── public/
│   └── tfjs_model/
│       ├── model.json
│       ├── group1-shard1of1.bin
│       ├── labels.json
│       └── metadata.json
├── src/
│   └── ...
└── package.json
```

---

## CHẠY APPLICATION

### Development Mode

```bash
npm run dev
```

Mở browser: `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

### Deploy to Production

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

---

## TROUBLESHOOTING

### Python Issues

**Error**: `ModuleNotFoundError: No module named 'tensorflow'`

**Solution**:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

**Error**: `CUDA not found` (nếu có GPU)

**Solution**: Cài đặt CUDA Toolkit và cuDNN, hoặc sử dụng CPU version:
```bash
pip install tensorflow-cpu==2.15.0
```

---

**Error**: Dataset not found

**Solution**: Đảm bảo thư mục `dataset/` tồn tại và có đúng cấu trúc:
```bash
python generate_sample_data.py  # Tạo dữ liệu mẫu
```

---

### React/Node Issues

**Error**: `Module not found: '@mediapipe/hands'`

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Error**: Model loading failed (404)

**Solution**: Kiểm tra xem model đã được copy vào `public/tfjs_model/` chưa:
```bash
ls -la public/tfjs_model/
```

---

**Error**: Camera access denied

**Solution**:
1. Cho phép camera trong browser settings
2. Sử dụng HTTPS (localhost được miễn)
3. Reload page

---

### Browser Issues

**Error**: WebGL not supported

**Solution**: Nâng cấp browser lên phiên bản mới nhất hoặc enable WebGL:
- Chrome: `chrome://flags/#enable-webgl`
- Firefox: `about:config` → `webgl.disabled` = false

---

**Error**: Low FPS (<10)

**Solutions**:
1. Giảm video resolution
2. Tắt các tab/app khác
3. Sử dụng GPU acceleration
4. Giảm `maxNumHands` xuống 1

---

### Performance Optimization

**Tăng tốc độ inference**:

1. Quantization (đã áp dụng):
```python
tfjs.converters.save_keras_model(
    model, 'tfjs_model',
    quantization_dtype_map={'uint8': '*'}
)
```

2. Model pruning (advanced):
```python
import tensorflow_model_optimization as tfmot
pruning_schedule = tfmot.sparsity.keras.PolynomialDecay(...)
```

3. WebAssembly backend:
```javascript
import * as tf from '@tensorflow/tfjs';
await tf.setBackend('wasm');
```

---

## TESTING

### Unit Tests (Python)

```bash
pytest tests/
```

### Integration Tests (React)

```bash
npm test
```

### Manual Testing Checklist

- [ ] Camera được phát hiện và hiển thị
- [ ] Hand landmarks được vẽ chính xác
- [ ] Model load thành công
- [ ] Predictions hiển thị với confidence score
- [ ] FPS ổn định ở 20-30
- [ ] Responsive trên mobile
- [ ] Hoạt động offline sau lần load đầu tiên

---

## NEXT STEPS

1. Thu thập thêm dữ liệu thực tế
2. Thêm nhiều ký hiệu hơn (mục tiêu: 20-50 ký hiệu)
3. Cải thiện model architecture
4. Thêm tính năng text-to-speech
5. Multilingual support
6. Mobile app version

---

## HỖ TRỢ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [GitHub Issues](https://github.com/your-repo/issues)
2. Đọc [FAQ](FAQ.md)
3. Liên hệ: your-email@example.com

---

**Good luck! 🚀**
