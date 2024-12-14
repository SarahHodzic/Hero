'use client'
import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation'

interface Quiz {
  quiz_id: string;
  owner_id: string;
  title: string;
  category_id: number;
};

interface CurrentUser {
  name: string,
  lastname: string,
  email: string,
  role_id: number,
  id: number,
}

interface ListOfQuizProps {
  selectedCategory: number | null;
  searchQuery: string;
}

const ListOfQuiz: React.FC<ListOfQuizProps> = ({ selectedCategory, searchQuery  }) => {
  const router = useRouter()

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userData, setUserData] = useState<CurrentUser | null>(null);
  const [visibleQuizzes, setVisibleQuizzes] = useState(8);

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


  // We are fetching a list of quizzes from the database that we want to display on the page.
  useEffect(() => {
    async function getAllQuizzesFromDatabase() {
      try {
        if(userData?.id){
          const response = await axios.get(`http://localhost:8000/quiz/quizzes/${userData?.id}`);
        setQuizzes(response.data);
        }
        
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    }
    getAllQuizzesFromDatabase();
  }, [userData]);

  // Filtering quizzes by categories and filtering quizzes when using the search bar.
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCategory = selectedCategory ? quiz.category_id === selectedCategory : true;
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const loadMore = () => {
    setVisibleQuizzes((prev) => prev + 8);
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4} sx={{ marginTop: 4 }}>
        {filteredQuizzes.slice(0, visibleQuizzes).map((quiz, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>

            <Card onClick={() => router.push(`/quiz/${quiz.quiz_id}`)} style={{ cursor: 'pointer' }}>
              <CardContent>
                <Typography variant="h6">Quiz {index + 1}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {quiz.title}
                </Typography>
              </CardContent>

            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4, marginBottom: '80px' }}>
       
      </Box>
    </Container>
  );
};

export default ListOfQuiz;