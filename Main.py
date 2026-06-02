from tkinter import CURRENT
import tkinter as tk
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key=os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: Could not find GEMINI_API_KEY. Check your .env file!")
else:
    genai.configure(api_key=api_key)
    print("AI configured successfully!")

model = genai.GenerativeModel("gemini-2.5-flash")
current_answer = ""
def get_question(difficulty):
    global current_answer
    question_label.config(text="generating question... please wait...")
    window.update()
    
    prompt = (
        f"give me one multiple choice question for AP Computer science principles exa. The difficulty should be {difficulty}. include options A, B, C, and D. also output the correct answer.  " 
        f"difficulty: {difficulty}. include options A, b c and D. "
        f"At the very end of your response, write '|||' followed by just the correct answer letter and explanation"
    )
    response = model.generate_content(prompt)
    full_text = response.text


    if "|||" in full_text:
        parts = full_text.split("|||")
        question_text = parts[0].strip()
        current_answer = parts[1].strip()
    else:
        question_text = full_text
        current_answer = "Answer details weren't formatted correctly by AI."

    question_label.config(text=question_text)
def show_answer():
    if current_answer:

        question_label.config(text=f"{question_label.cget('text')}\n\n[ answer ] \n{current_answer}")
    else:
        question_label.config(text=f"generate a question first")
window = tk.Tk()
window.title("AP CSP MCQ GENERATOR")
window.geometry("500x500")


question_label = tk.Label(window,text="Press a button", wraplength=450)
question_label.pack(pady=20)

easy_btn = tk.Button(window, text="EASY QUESTION", command=lambda: get_question("Easy"))
easy_btn.pack(pady=5) 

hard_btn = tk.Button(window, text="HARD QUESTION", command=lambda: get_question("hard"))
hard_btn.pack(pady=5)

answer_btn = tk.Button(window, text="SHOW ANSWER", command=show_answer)
answer_btn.pack(pady=5)


window.mainloop()


