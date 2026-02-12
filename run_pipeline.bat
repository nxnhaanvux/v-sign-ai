@echo off
REM V-Sign AI - Complete Pipeline Runner (Windows)
REM This script automates the entire process from data generation to deployment

echo ==========================================
echo   V-SIGN AI - COMPLETE PIPELINE
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)

echo [STEP] Starting V-Sign AI Pipeline...
echo.

REM ===== STEP 1: Setup Python Environment =====
echo [STEP] 1/6: Setting up Python environment...

if not exist "venv" (
    python -m venv venv
    echo   ^> Virtual environment created
) else (
    echo   ^> Virtual environment already exists
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install Python dependencies
echo [STEP] Installing Python dependencies...
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo   ^> Python dependencies installed
echo.

REM ===== STEP 2: Generate Sample Data =====
echo [STEP] 2/6: Generating sample dataset...

if not exist "dataset" (
    python generate_sample_data.py
    echo   ^> Sample dataset generated (250 samples)
) else (
    echo   [WARNING] Dataset folder already exists. Skipping generation.
    echo   To regenerate, delete the 'dataset' folder and run again.
)
echo.

REM ===== STEP 3: Train Model =====
echo [STEP] 3/6: Training LSTM model...

if not exist "best_model.h5" (
    python train_model.py
    echo   ^> Model trained successfully
) else (
    echo   [WARNING] Model already exists. Skipping training.
    echo   To retrain, delete 'best_model.h5' and run again.
)
echo.

REM ===== STEP 4: Convert to TensorFlow.js =====
echo [STEP] 4/6: Converting model to TensorFlow.js...

if not exist "tfjs_model" (
    python convert_to_tfjs.py
    echo   ^> Model converted to TensorFlow.js
) else (
    echo   [WARNING] TensorFlow.js model already exists.
    echo   To reconvert, delete 'tfjs_model' folder and run again.
)
echo.

REM ===== STEP 5: Setup React App =====
echo [STEP] 5/6: Setting up React application...

cd react-app

if not exist "node_modules" (
    call npm install
    echo   ^> Node dependencies installed
) else (
    echo   ^> Node dependencies already installed
)

REM Copy model to public folder
if not exist "public\tfjs_model" (
    xcopy /E /I ..\tfjs_model public\tfjs_model
    echo   ^> Model copied to public folder
) else (
    echo   ^> Model already in public folder
)
echo.

REM ===== STEP 6: Build Application =====
echo [STEP] 6/6: Building application...

call npm run build
echo   ^> Application built successfully
echo.

echo ==========================================
echo   ✓ PIPELINE COMPLETED SUCCESSFULLY!
echo ==========================================
echo.
echo Next steps:
echo   1. To run in development mode:
echo      cd react-app ^&^& npm run dev
echo.
echo   2. To preview production build:
echo      cd react-app ^&^& npm run preview
echo.
echo   3. To deploy to production:
echo      cd react-app ^&^& npm run deploy
echo.
echo Output files:
echo   - best_model.h5         : Trained Keras model
echo   - tfjs_model\           : TensorFlow.js model
echo   - react-app\dist\       : Production build
echo.
echo Happy coding! 🚀

pause
