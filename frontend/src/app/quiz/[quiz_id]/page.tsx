'use client';
import React, { useEffect, useState } from 'react';
import Quiz from '../../../components/QuizQuestion';
import { Container, CssBaseline } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation'
import { getCurrentUser, User } from '@/services/getCurrentUser';
import { Box, CircularProgress, Typography } from '@mui/material';
import { shuffle } from 'lodash';

interface QuizData {
  quiz_id: number;
  title: string;
  questions: string[];
}

const QuizPage = ({ params }: { params: { quiz_id: number } }) => {
  const router = useRouter()

  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const userData = await getCurrentUser(token);
        if (userData && (userData?.role_id === 1 || userData?.role_id === 2 || userData?.role_id === 3)) {
          setUser(userData);
        } else {
          router.push('/login');
        }
        setUser(userData);
      } catch (error) {

      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    async function getOneQuizFromDatabase() {
      try {
        const response = await axios.get(`http://localhost:8000/quiz/find-quiz/${params.quiz_id}`);
        const data = response.data;
        const updatedQuestions = data.questions.map(question => {
          return {
            ...question,
            answers: shuffle(question.answers)
          };
        });
        setQuizData({
          ...data,
          questions: updatedQuestions
        });
        
      } catch (error) {
        console.error("Error retrieving a quiz from the database:", error);
      }
    }

    getOneQuizFromDatabase();
  }, []);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <main>
          {quizData ? (
            <Quiz title={quizData.title} questions={quizData.questions} quiz_id={params.quiz_id} />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100vh"
            >
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading, please wait...
              </Typography>
            </Box>
          )}
        </main>
      </Container>
    </>
  );
};

export default QuizPage;



