# O-RADS™ Ultrasound Analyzer

An AI-powered medical imaging application that analyzes ovarian ultrasound images and computes O-RADS (Ovarian-adnexal Reporting and Data System) scores for clinical risk assessment. The application provides intelligent analysis, clinical recommendations, and supports multiple languages.

## 🎯 Features

### Core Features
- **AI-Powered Analysis**: Uses ResNet50 deep learning model to analyze ultrasound images
- **O-RADS Score Prediction**: Computes risk scores (1-5) based on ACR clinical guidelines
- **Confidence Scoring**: Provides confidence percentages for each prediction
- **Clinical Features**: Generates detailed clinical feature reports (size, vascularity, wall characteristics, etc.)
- **Risk Classification**: Categorizes findings as benign, indeterminate, or suspicious with danger flags
- **LLM-Enhanced Insights**: Groq API integration for AI-powered clinical recommendations
- **Analysis History**: Stores and retrieves previous analyses with timestamps
- **Chat Interface**: AI-powered chatbot for medical queries and follow-up questions
- **PDF Report Generation**: Export analysis results as professional PDF reports with QR codes
- **Dark/Light Theme**: Toggle between dark and light UI modes
- **Multi-Language Support**: English, Spanish, Hindi, and Kannada interfaces

### Clinical Features
- Image statistics analysis (brightness, contrast)
- Cyst characterization (simple, complex, hemorrhagic)
- Solid component percentage calculation
- Vascularity assessment
- Wall irregularity detection
- Clinical risk assessment with specialist referral recommendations

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask 2.3.0
- **Deep Learning**: TensorFlow 2.13.0 with ResNet50
- **Image Processing**: OpenCV 4.8.0.74, Pillow 10.0.0
- **Machine Learning**: scikit-learn 1.3.0
- **AI/LLM**: Groq API (llama-3.1-8b-instant model)
- **Environment Management**: python-dotenv 1.0.0

### Frontend
- **Markup**: HTML5
- **Styling**: CSS3 (with dark/light theme support)
- **Scripting**: JavaScript (Vanilla)
- **Libraries**: 
  - html2canvas (screenshot generation)
  - jsPDF (PDF export)
  - QR Code JS (QR code generation)

### Dependencies
- NumPy (numerical computing)
- Werkzeug (WSGI utility library)
- Secure file handling with werkzeug

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Python**: 3.8 or higher
- **pip**: Python package manager
- **Virtual Environment**: venv (included with Python) or virtualenv
- **Groq API Key**: Required for AI chat and analysis features

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd orad-mri-app
```

### Step 2: Create Virtual Environment

#### On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### On Windows (Command Prompt):
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

#### On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Create Environment Variables

Create a `.env` file in the project root directory with the following variables:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Flask Configuration (optional)
FLASK_ENV=development
FLASK_DEBUG=True

# Upload Configuration (optional)
MAX_UPLOAD_SIZE=16777216  # 16MB in bytes
ALLOWED_EXTENSIONS=png,jpg,jpeg

# Server Configuration (optional)
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
```

#### How to Get Groq API Key:
1. Visit [Groq Console](https://console.groq.com)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key and paste it in the `.env` file

### Step 5: Project Structure

Verify your project structure matches:
```
orad-mri-app/
├── app.py                 # Main Flask application
├── model.py              # ML model and predictor class
├── feature_extractor.py  # Clinical feature generator
├── utils.py              # Utility functions and LLM integration
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (create this)
├── static/
│   ├── script.js         # Frontend JavaScript
│   ├── style.css         # Frontend styling
│   └── locales/          # Translation files
│       ├── en.json       # English translations
│       ├── es.json       # Spanish translations
│       ├── hi.json       # Hindi translations
│       └── kn.json       # Kannada translations
├── templates/
│   └── index.html        # Main HTML template
└── uploads/              # Temporary upload directory
```

## 🏃 Running the Application

### Step 1: Activate Virtual Environment

#### Windows (PowerShell):
```powershell
.\venv\Scripts\Activate.ps1
```

#### Windows (Command Prompt):
```cmd
venv\Scripts\activate.bat
```

#### macOS/Linux:
```bash
source venv/bin/activate
```

### Step 2: Start the Flask Server

```bash
python app.py
```

You should see output similar to:
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### Step 3: Access the Application

Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

## 📖 Usage Guide

### 1. Upload Ultrasound Image
- Click "Select Image" or drag & drop an ultrasound image (PNG, JPG, JPEG)
- Maximum file size: 16 MB
- Image is processed and deleted after analysis

### 2. View Analysis Results
The application displays:
- **O-RADS Score**: Risk classification (1-5)
- **Confidence Score**: Prediction certainty percentage
- **Danger Flag**: Visual indicator if specialist consultation is needed
- **Class Probabilities**: Breakdown by risk category
- **Clinical Features**: Detailed imaging characteristics
- **Image Features**: Brightness and contrast metrics
- **AI Recommendation**: LLM-generated clinical guidance

### 3. O-RADS Score Interpretation
- **Score 1**: Normal ovary, <0.5% malignancy risk
- **Score 2**: Benign cyst, <0.5% malignancy risk
- **Score 3**: Indeterminate lesion, 0.5-5% risk (requires follow-up)
- **Score 4**: Suspicious findings, 5-50% risk (specialist referral recommended)
- **Score 5**: Highly suspicious, >50% risk (urgent oncology referral)

### 4. Generate Reports
- Click "Download PDF" to export professional analysis report
- Reports include QR codes for digital sharing
- All clinical findings and recommendations are included

### 5. Chat with AI
- Ask follow-up questions about the analysis
- Get additional clinical insights
- Receive evidence-based recommendations

### 6. View Analysis History
- Access previous analyses from the history panel
- Track multiple patient cases
- Review timestamps and results

### 7. Change Language
- Select from dropdown: English, Español, हिन्दी, ಕನ್ನಡ
- UI updates in real-time

## ⚙️ Configuration

### .env File Details

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `GROQ_API_KEY` | Groq LLM API authentication | `gsk_...` | ✅ Yes |
| `FLASK_ENV` | Environment mode | `development` or `production` | ❌ No |
| `FLASK_DEBUG` | Enable debug mode | `True` or `False` | ❌ No |
| `MAX_UPLOAD_SIZE` | Max file upload in bytes | `16777216` (16MB) | ❌ No |
| `FLASK_HOST` | Server host | `0.0.0.0` | ❌ No |
| `FLASK_PORT` | Server port | `5000` | ❌ No |

### Flask Configuration

Default settings in `app.py`:
- **Upload Folder**: `uploads/`
- **Max File Size**: 16 MB
- **Allowed Formats**: PNG, JPG, JPEG
- **Session Management**: Secure random key
- **Port**: 5000
- **Host**: 127.0.0.1 (local development)

## 🔧 Troubleshooting

### Issue: ModuleNotFoundError - No module named 'flask'
**Solution**: Ensure virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

### Issue: GROQ_API_KEY not found
**Solution**: 
1. Create `.env` file in project root
2. Add `GROQ_API_KEY=your_key_here`
3. Restart Flask server

### Issue: TensorFlow not loading properly
**Solution**:
```bash
pip install --upgrade tensorflow==2.13.0
```

### Issue: Port 5000 already in use
**Solution**: Change port in Flask app or kill the process using port 5000:
```powershell
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Issue: Image upload fails
**Solution**:
- Ensure file size < 16 MB
- Use only PNG or JPG format
- Check `uploads/` folder has write permissions

## 📊 API Endpoints

### Predict
```
POST /predict
Content-Type: multipart/form-data
Body: file (image file)

Response: 
{
  "orad_score": 3,
  "confidence": 75.5,
  "class_probabilities": {...},
  "danger_flag": true,
  "suggestion": "...",
  "llm_analysis": "...",
  "clinical_features": {...},
  "image_features": {...},
  "timestamp": "2026-04-27T10:30:00",
  "id": 1
}
```

### History
```
GET /history

Response: [
  {analysis_object_1},
  {analysis_object_2},
  ...
]
```

### Chat
```
POST /chat
Content-Type: application/json
Body: {
  "message": "What does this score mean?",
  "history": [...]
}

Response: {
  "response": "AI-generated response..."
}
```

## 📝 Model Details

### Architecture
- **Base Model**: ResNet50 (pre-trained on ImageNet)
- **Input Size**: 224x224 pixels (RGB)
- **Pooling**: Average pooling
- **Feature Extraction**: Flattened dense features

### Processing Pipeline
1. Image loading and RGB conversion
2. Resize to 224x224
3. Preprocessing with ResNet50 normalization
4. Feature extraction via ResNet50
5. Rule-based O-RADS scoring using image statistics
6. Clinical feature generation
7. LLM analysis and recommendations

### Scoring Algorithm
The model analyzes:
- **Brightness**: Mean pixel intensity
- **Contrast**: Standard deviation of pixels
- **Clinical characteristics**: Size, vascularity, septations, wall properties

## 🔐 Security Considerations

- ✅ File uploads validated by type and size
- ✅ Secure filename handling with werkzeug
- ✅ Temporary files deleted after processing
- ✅ Session management with secure keys
- ✅ API key stored in environment variables (not in code)
- ⚠️ For production: Use HTTPS, implement authentication, enable CORS carefully

## 📈 Performance Optimization

- **Async Processing**: Image analysis runs synchronously (consider Celery for scaling)
- **Model Caching**: ResNet50 loaded once at startup
- **File Cleanup**: Temporary uploads deleted immediately after analysis
- **Memory Management**: Images resized to 224x224 before processing

## 🚀 Deployment

### Development Server
```bash
python app.py
```

### Production Server (Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
ENV GROQ_API_KEY=your_key_here
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 📚 References

- [O-RADS Guidelines](https://www.acr.org)
- [Groq API Documentation](https://console.groq.com/docs)
- [TensorFlow Documentation](https://www.tensorflow.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)

## ⚠️ Medical Disclaimer

**This application is for educational and research purposes only.** It is not FDA-approved and should not be used for clinical diagnosis without professional medical interpretation. Always consult qualified medical professionals for diagnostic decisions.

## 📄 License

[Add your license here - e.g., MIT, Apache 2.0]

## 👥 Contributors

[Add contributor information]

## 📧 Support & Contact

For issues, questions, or contributions, please:
1. Open an issue on GitHub
2. Contact: [your contact information]

---

**Last Updated**: April 27, 2026  
**Version**: 1.0.0
