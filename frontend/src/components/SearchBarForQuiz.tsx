'use client'
import React, { useEffect, useState } from 'react';
import { Box, Button, Container, TextField, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation'
import axios from 'axios';

interface CurrentUser {
  name: string,
  lastname: string,
  email: string,
  role_id: number,
  id: number,
}

interface SearchBarForQuizProps {
  onSearch: (query: string) => void;
}

const SearchBarForQuiz: React.FC<SearchBarForQuizProps> = ({ onSearch }) => {

  const [userData, setUserData] = useState<CurrentUser | null>(null);
  const router = useRouter()

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

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          sx={{ flexGrow: 1, minWidth: 200 }}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          {userData && (userData.role_id === 2 || userData.role_id === 3) && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => router.push('/quiz/create-quiz')}
            >
              Create Quiz
            </Button>
          )}
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => router.push(`/quiz/passed/${userData?.id}`)}
          >
            Passed Quizzes
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SearchBarForQuiz;