import { useState, useEffect } from 'react';

const ExamComponent = ({ exam, savedProgress, onComplete }) => {
  const [answers, setAnswers] = useState(savedProgress?.answers || {});
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = savedProgress?.timeLeft;
    return savedTime !== undefined ? savedTime : 10 * 60; // 10 minutes in seconds
  });
  const [isComplete, setIsComplete] = useState(savedProgress?.completed || false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(savedProgress?.currentQuestionIndex || 0);
  const [isCorrect, setIsCorrect] = useState(null); // Track if checked answer is correct
  const [hasChecked, setHasChecked] = useState(false); // Track if answer has been checked
  const [correctCount, setCorrectCount] = useState(0); // Track number of correct answers

  useEffect(() => {
    if (timeLeft > 0 && !isComplete) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsComplete(true);
            calculateCorrectAnswers();
            onComplete(exam.id, answers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isComplete, answers, exam.id, onComplete]);

  useEffect(() => {
    if (!isComplete) {
      localStorage.setItem('examProgress', JSON.stringify({
        ...JSON.parse(localStorage.getItem('examProgress') || '{}'),
        [exam.id]: { answers, timeLeft, currentQuestionIndex, completed: isComplete },
      }));
    }
  }, [answers, timeLeft, currentQuestionIndex, isComplete, exam.id]);

  const calculateCorrectAnswers = () => {
    let count = 0;
    exam.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        count += 1;
      }
    });
    setCorrectCount(count);
  };

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
    setHasChecked(false); // Reset check status when selecting a new option
    setIsCorrect(null); // Reset feedback
  };

  const handleCheckAnswer = () => {
    const currentQuestion = exam.questions[currentQuestionIndex];
    const isAnswerCorrect = answers[currentQuestion.id] === currentQuestion.correctAnswer;
    setIsCorrect(isAnswerCorrect);
    setHasChecked(true);
    if (isAnswerCorrect) {
      calculateCorrectAnswers(); // Update correct count immediately for correct answers
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsCorrect(null);
      setHasChecked(false);
    } else {
      setIsComplete(true);
      calculateCorrectAnswers();
      onComplete(exam.id, answers);
    }
  };

  const handleNext = () => {
    if (isCorrect && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsCorrect(null);
      setHasChecked(false);
    }
  };


  const handleSubmit = () => {
    if (isCorrect) {
      setIsComplete(true);
      calculateCorrectAnswers();
      onComplete(exam.id, answers);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculateExamProgress = () => {
    return ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  };

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{exam.title}</h2>
        <div className="text-lg font-medium">Time Left: {formatTime(timeLeft)}</div>
      </div>
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${calculateExamProgress()}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Question {currentQuestionIndex + 1} of {exam.questions.length}
        </p>
      </div>
      {!isComplete ? (
        <>
          <div className="mb-4">
            <p className="font-medium">{currentQuestion.text}</p>
            <div className="mt-2 space-y-2">
              {currentQuestion.options.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={() => handleAnswer(currentQuestion.id, option)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
            {hasChecked && (
              <p className={`mt-2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}.`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-between items-center gap-2">
      
          
            <button
              onClick={handleCheckAnswer}
              disabled={!answers[currentQuestion.id]}
              className={`px-4 py-2 rounded ${
                !answers[currentQuestion.id]
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              Check Answer
            </button>
            <button
              onClick={handleSkipQuestion}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Skip Question
            </button>
            {currentQuestionIndex < exam.questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isCorrect}
                className={`px-4 py-2 rounded ${
                  !isCorrect
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isCorrect}
                className={`px-4 py-2 rounded ${
                  !isCorrect
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Submit Exam
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="text-green-500">
          Exam Completed! You got {Math.round((correctCount / exam.questions.length) * 100)}% correct ({correctCount}/{exam.questions.length} answers).
        </p>
      )}
    </div>
  );
};

export default ExamComponent;