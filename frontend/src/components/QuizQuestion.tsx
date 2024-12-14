import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Container, Paper, Button } from '@mui/material';
import axios from 'axios';

interface Question {
  question: string;
  answers: { answer_id: number; answer: string; status: boolean }[];
}

interface CurrentUser {
  name: string,
  lastname: string,
  email: string,
  role_id: number,
  id: number,
}
interface QuizProps {
  quiz_id: number;
  title: string;
  questions: Question[];
}

interface PassedQuiz {
  quiz_id: number;
  user_id: number;
  title: string;
  number_of_questions: number;
  correct_answers: number;
  date: string;
};

const Quiz: FC<QuizProps> = ({ title, questions, quiz_id }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/auth/users/me/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData()
  }, [])

  const handleAnswerChange = (answerId: number) => {
    const updatedUserAnswers = [...userAnswers];
    updatedUserAnswers[currentQuestionIndex] = answerId;
    setUserAnswers(updatedUserAnswers);
    setSelectedAnswerId(answerId);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswerId(null);
    }
  };

  const handleSubmit = () => {

    const correctAnswersCount = userAnswers.reduce((acc: number, selectedAnswerId, index) => {
      const question = questions[index];
      const selectedAnswer = question.answers.find((answer) => answer.answer_id === selectedAnswerId);
      if (selectedAnswer && selectedAnswer.status) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);

    setScore(correctAnswersCount);
    setPassed(correctAnswersCount / questions.length >= 0.8);

    const currentDate = new Date();
    if (!userData || userData.id === undefined) {
      console.error("User ID is undefined");
      return;
    }
    const quizData: PassedQuiz = {
      quiz_id: quiz_id,
      title: title,
      user_id: userData?.id,
      number_of_questions: questions.length,
      correct_answers: correctAnswersCount,
      date: currentDate.toISOString(),
    }

    if (correctAnswersCount / questions.length >= 0.8) {
      saveResult(quizData)
    }
  };

  const saveResult = async (quizData: PassedQuiz) => {
    console.log(quizData)
    try {
      await axios.post('http://localhost:8000/quiz/quiz-result', quizData)
      console.log("Quiz results successfully saved to the database.")
    } catch (error) {
      console.log("Error saving results to the database: ", error)
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
            {title}
          </Typography>
        </Box>
        {score === null ? (
          <>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" component="p" sx={{ color: '#f50057' }}>
                {questions[currentQuestionIndex].question}
              </Typography>
              <RadioGroup value={selectedAnswerId} onChange={(e) => handleAnswerChange(parseInt(e.target.value))}>
                {questions[currentQuestionIndex].answers.map((answer) => (
                  <FormControlLabel
                    key={answer.answer_id}
                    value={answer.answer_id.toString()}
                    control={<Radio />}
                    label={answer.answer}
                    sx={{
                      mt: 2,
                      '& .MuiFormControlLabel-label': {
                        color: '#3f51b5',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button variant="contained" color="primary" onClick={handleNextQuestion}>
                  Next question
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                  Finish quiz
                </Button>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h5" component="p" sx={{ color: passed ? 'green' : 'red' }}>
              {passed ? 'Quiz successfully passed' : 'Failed. Try again later.'}
            </Typography>
            <Typography variant="h6" component="p" sx={{ color: passed ? 'green' : 'red' }}>
              Your score is {score} / {questions.length}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Quiz;






