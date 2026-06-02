import tkinter as tk
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
model = genai.GenerativeModel("gemini 1.5 flash")

if not api_key:
    print("Error: Could not find GEMINI_API_KEY. Check your .env file!")
else:
    genai.configure(api_key=api_key)
    print("AI configured successfully!")

def get_question(difficulty):
    question_label.config(text="generating question... please wait...")
    window.update()
    
    prompt = f"give me one multiple choice question for AP Computer science principles exa. The difficulty should be {difficulty}. include options A, B, C, and D. also output the correct answer.  " 
    
    response = model.generate_content(prompt)
    question_label.config(text=response.text)



window = tk.Tk()
window.title("AP CSP MCQ GENERATOR")
window.geometry("500x500")


question_label = tk.Label(window,text="Press a button", wraplength=450)
question_label.pack(pady=20)

easy_btn = tk.Button(window, text="EASY QUESTION")
easy_btn.pack(pady=5) 

hard_btn = tk.Button(window, text="HARD QUESTION")
hard_btn.pack(pady=5)

answer_btn = tk.Button(window, text="SHOW ANSWER")
answer_btn.pack(pady=5)
api_key=os.getenv("GEMINI_API_KEY")


window.mainloop()


