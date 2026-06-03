export interface Attempt {
  isCorrect: boolean;
}

export interface QuestionData {
  questionText: string;
  difficulty: "Easy" | "Hard";
}

export interface AnswerData {
  correctAnswer: string;
  explanation: string;
}

export interface StatsResult {
  total: number;
  correctCount: number;
  accuracyRate: number;
}
