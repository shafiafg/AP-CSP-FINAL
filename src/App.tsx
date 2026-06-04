import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Terminal, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  Award,
  BookOpen
} from "lucide-react";
import { Attempt, QuestionData, AnswerData, StatsResult } from "./types";

export default function App() {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"Easy" | "Hard">("Easy");
  
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [answerData, setAnswerData] = useState<AnswerData | null>(null);

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [stats, setStats] = useState<StatsResult>({
    total: 0,
    correctCount: 0,
    accuracyRate: 0.0
  });

  useEffect(() => {
    generateNewQuestion("Easy");
  }, []);

  const generateNewQuestion = async (level: "Easy" | "Hard") => {
    setLoading(true);
    setRevealed(false);
    setSelectedOption(null);
    setAnswerData(null);
    setDifficulty(level);

    try {
      const res = await fetch(`/api/question?difficulty=${level}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data);
      }
    } catch (error) {
      console.error("Failed to generate question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealAnswer = async () => {
    if (revealed || !question) return;

    try {
      const res = await fetch("/api/answer");
      if (res.ok) {
        const data: AnswerData = await res.json();
        setAnswerData(data);
        setRevealed(true);

        const isUserCorrect = selectedOption === data.correctAnswer;
        const newAttempt: Attempt = { isCorrect: isUserCorrect };
        const updatedAttempts = [...attempts, newAttempt];
        setAttempts(updatedAttempts);

        const statsRes = await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attempts: updatedAttempts })
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          const correct = updatedAttempts.filter(a => a.isCorrect).length;
          setStats({
            total: updatedAttempts.length,
            correctCount: correct,
            accuracyRate: updatedAttempts.length > 0 ? Math.round((correct / updatedAttempts.length) * 100) : 0
          });
        }
      }
    } catch (error) {
      console.error("Failed to retrieve correct answer:", error);
    }
  };

  const handleResetSession = () => {
    setAttempts([]);
    setStats({
      total: 0,
      correctCount: 0,
      accuracyRate: 0.0
    });
    generateNewQuestion("Easy");
  };

  return (
    <div id="frosted-glass-viewport" className="min-h-screen bg-[#050508] text-slate-100 flex items-center justify-center font-sans p-4 sm:p-6 md:p-8 overflow-x-hidden relative selection:bg-indigo-500/30">
      
      {/* Background radial blurs for Frosted Glass theme */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-indigo-600/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-blue-600/15 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none"></div>

      {/* Main glass frame */}
      <div className="relative w-full max-w-4xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header section */}
        <header className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold font-display">AP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-display">AP CSP MCQ generator</h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">All Exam Units</p>
            </div>
          </div>

          {/* Difficulty mode switch buttons - triggers live Flask fetch */}
          <div className="flex space-x-3 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              disabled={loading}
              onClick={() => generateNewQuestion("Easy")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                difficulty === "Easy"
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              } disabled:opacity-50`}
            >
              Easy
            </button>
            <button 
              disabled={loading}
              onClick={() => generateNewQuestion("Hard")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                difficulty === "Hard"
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              } disabled:opacity-50`}
            >
              Hard
            </button>
          </div>
        </header>

        {/* Practice playground workspace */}
        <main className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col min-h-[380px] justify-between">
          
          {loading ? (
            /* Explicit beginner friendly LOADING state required */
            <div id="loading-state" className="flex-1 flex flex-col items-center justify-center py-16 text-center animate-pulse">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
              <h3 className="text-lg font-bold font-display text-white">Generating question... please wait...</h3>
              <p className="text-xs text-slate-400 mt-1">Calling python math/AP algorithm logic and configuring options...</p>
            </div>
          ) : question ? (
            <div id="interactive-mcq-workspace" className="flex-1 flex flex-col">
              
              {/* Question metadata badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Active Question • Difficulty: {difficulty}
                </span>
              </div>

              {/* Styled question prompt */}
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-medium leading-relaxed text-white/95 whitespace-pre-wrap font-sans">
                  {question.questionText}
                </h2>
              </div>

              {/* Selective Answer choices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {(["A", "B", "C", "D"] as const).map((letter) => {
                  const isChosen = selectedOption === letter;
                  const isCorrect = answerData?.correctAnswer === letter;
                  
                  let elementStyle = "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-slate-350";
                  let badgeStyle = "bg-white/5 text-slate-400";

                  if (revealed && answerData) {
                    if (isCorrect) {
                      elementStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-100 shadow-md";
                      badgeStyle = "bg-emerald-500/30 text-emerald-200 font-extrabold";
                    } else if (isChosen) {
                      elementStyle = "bg-rose-500/15 border-rose-500/40 text-rose-100 shadow-md";
                      badgeStyle = "bg-rose-500/30 text-rose-200 font-bold";
                    } else {
                      elementStyle = "bg-white/[0.01] border-white/5 opacity-50";
                    }
                  } else if (isChosen) {
                    elementStyle = "bg-indigo-500/20 border-indigo-500/50 text-white shadow-xl shadow-indigo-500/20";
                    badgeStyle = "bg-indigo-500/40 text-white font-extrabold";
                  }

                  return (
                    <button
                      key={letter}
                      disabled={revealed}
                      onClick={() => setSelectedOption(letter)}
                      className={`flex items-start p-4 border rounded-2xl text-left transition-all duration-200 ${elementStyle}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-xs font-bold shrink-0 transition-colors ${badgeStyle}`}>
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm mt-1 leading-relaxed">
                        Select Choice {letter}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* SHOW ANSWER control interface */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                {!revealed ? (
                  <button
                    onClick={handleRevealAnswer}
                    className="group relative px-10 py-4 bg-white text-slate-900 font-extrabold rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-150 to-white"></div>
                    <span className="relative z-10 text-xs sm:text-sm tracking-wider uppercase text-indigo-950 flex items-center justify-center gap-2">
                      <span>SHOW ANSWER</span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => generateNewQuestion(difficulty)}
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto text-center flex items-center justify-center gap-2"
                  >
                    <span className="text-xs sm:text-sm tracking-wider uppercase">Next AP Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Detailed Explanation Drawer displayed with clean animation constraints */}
              {revealed && answerData && (
                <div id="explanation-drawer" className="mt-4 p-5 sm:p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                  <div className="flex items-center space-x-2.5 mb-3">
                    {selectedOption === answerData.correctAnswer ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                        {selectedOption === answerData.correctAnswer ? "Correct Answer Chosen!" : "Incorrect Choice Selected"}
                      </h4>
                      <p className="text-xs text-indigo-300">The correct answer is Option {answerData.correctAnswer}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap pl-1 font-sans">
                    {answerData.explanation}
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-20">
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <p className="mt-4 text-sm text-slate-400 font-medium">Click a difficulty level to fetch your standard AP MCQ set!</p>
            </div>
          )}

          {/* Quick Stats Summary Board */}
         {stats.total > 0 && (
           <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center space-x-2">
               <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-bold uppercase tracking-wider font-display">Active Session</span>
             </div>
             <button 
               onClick={handleResetSession}
               className="text-[10px] text-slate-500 hover:text-rose-400 transition-all font-bold tracking-wider uppercase bg-white/5 hover:bg-rose-500/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-rose-500/10"
             >
               Clear Stats
             </button>
           </div>
         )}
         
        </main>

        {/* Footer info displaying verified computed analytics */}
        <footer className="px-8 py-4 bg-black/20 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-[10px] text-slate-500 font-mono select-none">
            CONNECTED TO RENDER_FLASK_API:5000 | COMPAT_RUNNING: TEST_MODE
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Accuracy: {stats.accuracyRate}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Total Solved: {stats.total}</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
