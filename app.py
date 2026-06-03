import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
#flask, request, jsonify, and CORS have all been coloborated by google ai studio and intergrating them into my project. 
app = Flask(__name__)
CORS(app)

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-3.5-flash")

current_correct_answer = "A"
current_explanation = "AP Computer Science Principles deals with digital representations like binary encoding."

def calculate_stats(attempts):
    correct_count = 0
    for attempt in attempts:
        if attempt.get("isCorrect") == True:
            correct_count = correct_count + 1
        else:
            correct_count = correct_count + 0
    return correct_count

@app.route("/api/question", methods=["GET"])
def get_question():
    global current_correct_answer, current_explanation
    difficulty = request.args.get("difficulty", "Easy")
    
    prompt = (
        f"Give me one multiple choice question for the AP Computer Science Principles Exam. "
        f"The difficulty level must be strictly: {difficulty}. "
        f"Include four choices clearly labeled as A, B, C, and D. "
        f"At the very end of your response, write exactly the characters '|||' followed immediately by the correct letter choice and a simple explanation of why it is correct."
    )
    
    try:
        response = model.generate_content(prompt)
        text = response.text
        
        if "|||" in text:
            parts = text.split("|||")
            question_text = parts[0].strip()
            answer_part = parts[1].strip()
            
            current_correct_answer = answer_part[0].upper()
            current_explanation = answer_part[1:].strip()
        else:
            question_text = text
            current_correct_answer = "A"
            current_explanation = "The AI successfully generated the default answer choice."
            
        return jsonify({
            "questionText": question_text,
            "difficulty": difficulty
        })
    except Exception as e:
        question_text = "Which routing algorithm is commonly used to find the shortest path across internet networks?"
        current_correct_answer = "A"
        current_explanation = "Dijkstra's algorithm or distance-vector protocols evaluate optimal physical routes."
        return jsonify({
            "questionText": question_text,
            "difficulty": difficulty
        })

@app.route("/api/answer", methods=["GET"])
def show_answer():
    global current_correct_answer, current_explanation
    return jsonify({
        "correctAnswer": current_correct_answer,
        "explanation": current_explanation
    })

@app.route("/api/stats", methods=["POST"])
#Colaborated with google ai studio
def stats_route():
    data = request.get_json() or {}
    attempts_list = data.get("attempts", [])
    correct = calculate_stats(attempts_list)
    total = len(attempts_list)
    rate = 0.0
    if total > 0:
        rate = round((correct / total) * 100, 1)
    return jsonify({
        "total": total,
        "correctCount": correct,
        "accuracyRate": rate
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
