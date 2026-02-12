#!/bin/bash

# V-Sign AI - Complete Pipeline Runner
# This script automates the entire process from data generation to deployment

set -e  # Exit on error

echo "=========================================="
echo "  V-SIGN AI - COMPLETE PIPELINE"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo ""
print_step "Starting V-Sign AI Pipeline..."
echo ""

# ===== STEP 1: Setup Python Environment =====
print_step "1/6: Setting up Python environment..."

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install Python dependencies
print_step "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "✓ Python dependencies installed"

echo ""

# ===== STEP 2: Generate Sample Data =====
print_step "2/6: Generating sample dataset..."

if [ ! -d "dataset" ]; then
    python generate_sample_data.py
    echo "✓ Sample dataset generated (250 samples)"
else
    print_warning "Dataset folder already exists. Skipping generation."
    echo "  To regenerate, delete the 'dataset' folder and run again."
fi

echo ""

# ===== STEP 3: Train Model =====
print_step "3/6: Training LSTM model..."

if [ ! -f "best_model.h5" ]; then
    python train_model.py
    echo "✓ Model trained successfully"
else
    print_warning "Model already exists. Skipping training."
    echo "  To retrain, delete 'best_model.h5' and run again."
fi

echo ""

# ===== STEP 4: Convert to TensorFlow.js =====
print_step "4/6: Converting model to TensorFlow.js..."

if [ ! -d "tfjs_model" ]; then
    python convert_to_tfjs.py
    echo "✓ Model converted to TensorFlow.js"
else
    print_warning "TensorFlow.js model already exists."
    echo "  To reconvert, delete 'tfjs_model' folder and run again."
fi

echo ""

# ===== STEP 5: Setup React App =====
print_step "5/6: Setting up React application..."

cd react-app

if [ ! -d "node_modules" ]; then
    npm install
    echo "✓ Node dependencies installed"
else
    echo "✓ Node dependencies already installed"
fi

# Copy model to public folder
if [ ! -d "public/tfjs_model" ]; then
    cp -r ../tfjs_model public/
    echo "✓ Model copied to public folder"
else
    echo "✓ Model already in public folder"
fi

echo ""

# ===== STEP 6: Build Application =====
print_step "6/6: Building application..."

npm run build
echo "✓ Application built successfully"

echo ""
echo "=========================================="
echo "  ✓ PIPELINE COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. To run in development mode:"
echo "     cd react-app && npm run dev"
echo ""
echo "  2. To preview production build:"
echo "     cd react-app && npm run preview"
echo ""
echo "  3. To deploy to production:"
echo "     cd react-app && npm run deploy"
echo ""
echo "Output files:"
echo "  - best_model.h5         : Trained Keras model"
echo "  - tfjs_model/           : TensorFlow.js model"
echo "  - react-app/dist/       : Production build"
echo ""
echo "Happy coding! 🚀"
