import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_llm_validation(orad_score, confidence, class_probs):
    prompt = f"""You are a medical AI quality assurance evaluator. 
Analyze the following model prediction for an ovarian ultrasound image.

Model Prediction:
- O-RADS Score: {orad_score}
- Confidence: {confidence:.1%}
- Class Probabilities: {json.dumps(class_probs, indent=2)}

Clinical O-RADS Standards (based on ACR guidelines):
- Score 1: Normal ovary, 0% malignancy risk.
- Score 2: Benign cyst (e.g., simple cyst), <0.5% risk.
- Score 3: Indeterminate lesion (e.g., hemorrhagic cyst), 0.5-5% risk – needs follow-up.
- Score 4: Suspicious lesion (e.g., solid components), 5-50% risk – refer to specialist.
- Score 5: Highly suspicious (e.g., papillary projections), >50% risk – urgent oncology referral.

Task:
1. Decide if the predicted O-RADS score is CLINICALLY CORRECT based on the probability distribution.
2. Provide a brief clinical rationale.
3. Suggest appropriate next steps.
4. Rate your confidence in this evaluation (Low/Medium/High).

Output format (strictly follow this):
VERDICT: [CORRECT/INCORRECT]
RATIONALE: [1 sentence]
RECOMMENDATION: [1 sentence]
CONFIDENCE: [Low/Medium/High]
"""
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are a strict medical evaluator. Output only the four lines as specified."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=200
        )
        result_text = response.choices[0].message.content.strip()
        lines = result_text.split('\n')
        verdict = "UNCERTAIN"
        rationale = "LLM output parsing failed"
        recommendation = "N/A"
        conf = "Low"
        for line in lines:
            if line.startswith("VERDICT:"):
                verdict = line.replace("VERDICT:", "").strip()
            elif line.startswith("RATIONALE:"):
                rationale = line.replace("RATIONALE:", "").strip()
            elif line.startswith("RECOMMENDATION:"):
                recommendation = line.replace("RECOMMENDATION:", "").strip()
            elif line.startswith("CONFIDENCE:"):
                conf = line.replace("CONFIDENCE:", "").strip()
        return {
            "verdict": verdict,
            "rationale": rationale,
            "recommendation": recommendation,
            "confidence": conf,
            "raw_response": result_text
        }
    except Exception as e:
        logging.error(f"Groq API error: {str(e)}")
        return {
            "verdict": "ERROR",
            "rationale": f"LLM validation failed: {str(e)}",
            "recommendation": "Check API key or network",
            "confidence": "Low",
            "raw_response": ""
        }