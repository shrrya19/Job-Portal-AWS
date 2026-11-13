import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Clock,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  HelpCircle,
  Briefcase
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { INTERVIEW_API_ENDPOINT } from "@/utils/constant";

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const answersRef = useRef({});
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const finalSubmitRef = useRef(null);

  // Timer state
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const speechSupported = typeof window !== "undefined" &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const recognitionRef = useRef(null);

  // Fetch session and start
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await axios.get(`${INTERVIEW_API_ENDPOINT}/${id}`, {
          withCredentials: true,
        });

        if (res.data?.success) {
          const fetchedInterview = res.data.interview;
          setInterview(fetchedInterview);

          // If already completed, redirect to feedback
          if (fetchedInterview.status === "Completed") {
            toast.info("This interview has already been completed.");
            navigate(`/demo-interview/feedback/${id}`);
            return;
          }

          // Populate answers map
          const ansMap = {};
          (fetchedInterview.questions || []).forEach((q) => {
            ansMap[q.id] = q.studentAnswer || "";
          });
          answersRef.current = ansMap;
          setAnswers(ansMap);

          // Set timer
          const duration = fetchedInterview.durationMinutes || 45;
          setTimeLeftSeconds(duration * 60);

          // Start session on server if scheduled
          if (fetchedInterview.status === "Scheduled") {
            await axios.post(`${INTERVIEW_API_ENDPOINT}/${id}/start`, {}, { withCredentials: true });
          }
        }
      } catch (err) {
        console.error("Session load error:", err);
        toast.error(err?.response?.data?.message || "Failed to start interview session.");
        navigate("/demo-interview");
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [id, navigate]);

  // Timer effect
  useEffect(() => {
    if (loading || !interview) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("Time has expired! Submitting your answers.");
          finalSubmitRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, interview]);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }

        if (transcript.trim() && interview?.questions?.[currentIndex]) {
          const qId = interview.questions[currentIndex].id;
          setAnswers((prev) => {
            const currentVal = prev[qId] || "";
            const updated = currentVal ? `${currentVal.trim()} ${transcript}` : transcript;
            const next = { ...prev, [qId]: updated };
            answersRef.current = next;
            return next;
          });
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [currentIndex, interview]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast.info("Voice input is not supported by your current browser. You can type your answer.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info("Voice recording paused.");
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Listening... Speak your answer clearly into your microphone.");
      } catch (err) {
        console.error("Speech start error:", err);
        toast.error("Could not start voice input. Check microphone permissions or type your answer.");
      }
    }
  };

  const handleAnswerChange = (val) => {
    if (!interview?.questions?.[currentIndex]) return;
    const qId = interview.questions[currentIndex].id;
    setAnswers((prev) => {
      const next = { ...prev, [qId]: val };
      answersRef.current = next;
      return next;
    });
  };

  // Save current question answer to backend
  const saveCurrentAnswer = async () => {
    if (!interview?.questions?.[currentIndex]) return;
    const currentQ = interview.questions[currentIndex];
    const val = answers[currentQ.id] || "";

    setSavingAnswer(true);
    try {
      await axios.put(
        `${INTERVIEW_API_ENDPOINT}/${id}/save-answer`,
        { questionId: currentQ.id, answer: val },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Error auto-saving answer:", err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleNext = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    await saveCurrentAnswer();
    if (currentIndex < (interview?.questions?.length || 1) - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    await saveCurrentAnswer();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Final submit
  const handleFinalSubmit = useCallback(async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answersRef.current).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans
      }));

      const res = await axios.post(
        `${INTERVIEW_API_ENDPOINT}/${id}/submit`,
        { answers: formattedAnswers },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Interview completed! Generating your evaluation report.");
        navigate(`/demo-interview/feedback/${id}`);
      } else {
        toast.error("Failed to evaluate interview.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err?.response?.data?.message || "Failed to submit interview.");
    } finally {
      setSubmitting(false);
      setConfirmModalOpen(false);
    }
  }, [id, isListening, navigate]);

  useEffect(() => {
    finalSubmitRef.current = handleFinalSubmit;
  }, [handleFinalSubmit]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto text-purple-400 animate-spin" size={48} />
          <p className="text-gray-300 font-medium">Entering Demo Interview Environment...</p>
        </div>
      </div>
    );
  }

  const questions = interview?.questions || [];
  const currentQuestion = questions[currentIndex] || {};
  const currentAnswer = answers[currentQuestion.id] || "";
  const answeredCount = Object.values(answers).filter((a) => a && a.trim().length > 0).length;

  // Format timer
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timerDisplay = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const isTimeRunningLow = timeLeftSeconds <= 300; // 5 min warning

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between select-none">
      {/* 1. TOP CONTROL BAR */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-white line-clamp-1">
                {interview?.jobTitle}
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>{interview?.companyName}</span>
                <span>•</span>
                <span className="text-purple-300 font-medium">{interview?.mode || "Self-Practice"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Badge */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
                isTimeRunningLow
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse"
                  : "bg-slate-800/80 text-purple-200 border-purple-500/30"
              }`}
            >
              <Clock size={16} />
              <span>{timerDisplay}</span>
            </div>

            <Button
              size="sm"
              onClick={() => setConfirmModalOpen(true)}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="mr-1.5" />}
              Finish Interview
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-6xl mx-auto mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>
              {answeredCount}/{questions.length} answered
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* 2. QUESTION & ANSWER WORKSPACE */}
      <main className="max-w-4xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col justify-center space-y-6">
        {/* Question Card */}
        <div className="bg-slate-800/80 rounded-3xl border border-slate-700/80 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                Q{currentIndex + 1}
              </span>
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">
                {currentQuestion.category || "Technical"}
              </Badge>
            </div>

            {currentQuestion.context && (
              <span className="text-xs text-slate-400 italic">
                {currentQuestion.context}
              </span>
            )}
          </div>

          <h2 className="text-lg md:text-2xl font-bold text-white leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Answer Input Area */}
        <div className="bg-slate-800/60 rounded-3xl border border-slate-700/60 p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              Your Response
              {savingAnswer && <span className="text-purple-400 italic">(saving...)</span>}
            </span>

            <div className="flex items-center gap-3">
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30"
                      : "bg-slate-700/80 text-purple-300 hover:bg-slate-700 border border-purple-500/20"
                  }`}
                  title="Toggle Voice Input (Speech to Text)"
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isListening ? "Listening..." : "Dictate Answer"}</span>
                </button>
              )}

              <span>
                {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </div>

          <textarea
            rows={8}
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type or dictate your answer here. Provide specific technical examples, architectural reasoning, and quantifiable outcomes where applicable..."
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 text-sm md:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-500"
          />

          <p className="text-[11px] text-slate-500 italic">
            Tip: Frame answers logically using: Context & Goal → Action & Technology → Result & Impact.
          </p>
        </div>
      </main>

      {/* 3. BOTTOM NAVIGATION BAR */}
      <footer className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40"
          >
            <ChevronLeft size={16} className="mr-1" /> Previous Question
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={() => setConfirmModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-lg"
            >
              Finish & Submit Interview <Send size={14} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-[#6A38C2] hover:bg-[#5B21B6] text-white font-bold px-6 shadow-lg"
            >
              Next Question <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </footer>

      {/* CONFIRMATION MODAL */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30">
                <HelpCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-white">Submit Interview Session?</h3>
              <p className="text-xs text-slate-400">
                You have answered <strong className="text-purple-300">{answeredCount} of {questions.length}</strong> questions. Once submitted, your answers will be evaluated against the job description.
              </p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span>Job:</span>
                <span className="font-semibold text-white">{interview?.jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span>{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Unanswered:</span>
                <span className={questions.length - answeredCount > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                  {questions.length - answeredCount}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModalOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                Keep Practicing
              </Button>
              <Button
                size="sm"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1.5" /> Evaluating...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSession;
