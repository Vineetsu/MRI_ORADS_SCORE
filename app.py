import os
import json
from flask import Flask, request, jsonify, render_template, session
from werkzeug.utils import secure_filename
from model import ORadPredictor
from groq import Groq
from dotenv import load_dotenv
from datetime import datetime
import uuid

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

predictor = ORadPredictor()

# In-memory history storage
analysis_history = []

# Groq client (for chat)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
CHAT_MODEL = "llama-3.1-8b-instant"   # or "llama-3.3-70b-versatile"

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        result = predictor.predict_orad_score(filepath)
        orad = result['orad_score']
        confidence = round(result['confidence'] * 100, 2)
        if orad >= 3:
            suggestion = "⚠️ O-RADS score ≥ 3 indicates suspicious findings. Recommend specialist consultation."
            danger_flag = True
        else:
            suggestion = "✅ O-RADS score < 3 suggests low risk. Routine monitoring is sufficient."
            danger_flag = False

        llm_analysis = f"""
Based on the ultrasound image analysis:
- The model detected an O-RADS score of {orad} with {confidence}% confidence.
- Image characteristics: brightness {result['features_used']['brightness']:.1f}, contrast {result['features_used']['contrast']:.1f}
- {'Higher scores suggest complex features that warrant further investigation.' if danger_flag else 'Low scores indicate benign appearance.'}
- Recommendation: {'Refer to gynecologic oncologist for further evaluation.' if danger_flag else 'Continue routine annual screening.'}
        """

        response_data = {
            'orad_score': orad,
            'confidence': confidence,
            'class_probabilities': result['class_probabilities'],
            'danger_flag': danger_flag,
            'suggestion': suggestion,
            'llm_analysis': llm_analysis.strip(),
            'clinical_features': result['clinical_features'],
            'image_features': result['features_used'],
            'timestamp': datetime.now().isoformat(),
            'id': len(analysis_history) + 1
        }

        # Store in history
        analysis_history.append(response_data)

        return jsonify(response_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@app.route('/history', methods=['GET'])
def history():
    return jsonify(analysis_history)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '').strip()
    history = data.get('history', [])
    if not user_message:
        return jsonify({'error': 'Empty message'}), 400

    # Use the most recent analysis as context (if any)
    context = ""
    if analysis_history:
        last = analysis_history[-1]
        context = f"Latest analysis: O-RADS {last['orad_score']} (confidence {last['confidence']}%). Clinical features: {last['clinical_features']}. Suggestion: {last['suggestion']}. "

    system_prompt = f"You are a medical assistant. {context}Answer the user's question concisely and helpfully. Do not give diagnoses. Suggest consulting a doctor when needed."

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        answer = response.choices[0].message.content.strip()
        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)