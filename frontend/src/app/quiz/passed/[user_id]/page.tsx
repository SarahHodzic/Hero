'use client'
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Grid, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation'
import { getCurrentUser, User } from '@/services/getCurrentUser';


interface PassedQuiz {
  result_id: number;
  quiz_id: string;
  user_id: string;
  title: string;
  category_id: number;
  number_of_questions: number;
  correct_answers: number;
  date: string;
};

const PassedQuizzes = ({ params }: { params: { user_id: string } }) => {
  const router = useRouter()

  const [passedQuizzes, setPassedQuizzes] = useState<PassedQuiz[]>([])
  // Authorization
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Authorization
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const userData = await getCurrentUser(token);
        if (userData && (userData?.role_id === 1 || userData?.role_id === 2 || userData?.role_id === 3)) {
          setUser(userData);
          setLoading(false);
        } else {
          router.push('/login');
        }
        setUser(userData);
      } catch (error) {

      }
    };
    fetchUser();
  }, []);

  const getPassedQuizzes = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/quiz/passed/${params.user_id}`)
      setPassedQuizzes(response.data)
      console.log("Successfully retrieved your data in passed quizzes.")
    } catch (error) {
      console.log("Error retrieving your passed quizzes.", error)
    }
  }

  useEffect(() => {
    getPassedQuizzes()
  }, [])

  return (
    <div>


      {loading ? (
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
      ) : <div>
        <Box sx={{ mt: 4, px: 2 }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            Passed Quizzes
          </Typography>
          {passedQuizzes.length === 0 ? (
            <Typography variant="body1" align="center">
              No quizzes to display
            </Typography>
          ) : (
            <Grid container spacing={2} justifyContent="center">
              {passedQuizzes.map((quiz) => (
                <Grid item xs={12} sm={6} md={4} key={quiz.result_id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        {quiz.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Date Taken: {quiz.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Score: {quiz.correct_answers}/{quiz.number_of_questions}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </div>
      }
      
    </div>
  )
};

export default PassedQuizzes;