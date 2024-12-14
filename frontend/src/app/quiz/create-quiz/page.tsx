'use client'
import React, { useEffect, useState } from 'react';
import { Container, CircularProgress, Typography, Grid, Button, Modal, TextField, Select, MenuItem, FormControl, InputLabel, Tooltip, Box, Snackbar, Alert, CardContent, Card, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation'
import axios from 'axios';
import { getCurrentUser, User } from '@/services/getCurrentUser';


interface Quiz {
  quiz_id: number;
  owner_id: number;
  title: string;
};

interface Category {
  category_id: number;
  category_title: string;
};

interface Answer {
  answer: string;
  status: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}


interface CurrentUser {
  name: string,
  lastname: string,
  email: string,
  role_id: number,
  id: number,
}

const CreateQuizPage = () => {
  const router = useRouter()

  // Muhamed Aletic
  // Dobavljam kvizove iz baze samo one koje je kreiro jedan doktor tj samo svoje moze uredjivat i njegovi ce mu se i prikazivati.

  const [doctorsQuizzes, setDoctorsQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuizName, setNewQuizName] = useState('');
  const [newQuizCategory, setNewQuizCategory] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [answers, setAnswers] = useState(['', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [errorQuestionMessage, setQuestionErrorMessage] = useState('');
  const [userData, setUserData] = useState<CurrentUser | null>(null);
  const [errorCategoryMessage, setCategoryErrorMessage] = useState('');

  // Create category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Authorization
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Authorization
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const userData = await getCurrentUser(token);
        if (userData && (userData?.role_id === 2 || userData?.role_id === 3)) {
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



  const handleOpenCategoryModal = () => setIsCategoryModalOpen(true);
  const handleCloseCategoryModal = () => setIsCategoryModalOpen(false);

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryErrorMessage('You must fill in all fields');
      return;
    }

    const category = {
      category_title: newCategory
    }
    try {
      const response = await axios.post("http://localhost:8000/quiz/create-category", category)
      console.log("Successfuly created quiz category.")
      getAllQuizCategoriesFromDatabase();

    } catch (error) {
      console.log("Error creating category: ", error)
    }
    setNewCategory('');
    setCategoryErrorMessage('')
    handleCloseCategoryModal();
  };

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


  useEffect(() => {
    getAllQuizzesFromDatabase();
  }, [userData]);

  const getAllQuizzesFromDatabase = async () => {
    try {
      if (userData?.id) {
        const response = await axios.get(`http://localhost:8000/quiz/doctors-quizzes/${userData?.id}`);
        setDoctorsQuizzes(response.data);
        console.log(response.data)
      }

    } catch (error) {
      console.error("Error retrieving doctor's quizzes: ", error);
    }
  }

  async function getAllQuizCategoriesFromDatabase() {
    try {
      const response = await axios.get('http://localhost:8000/quiz/categories');
      setCategories(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching quiz categories: ", error);
    }
  }
  useEffect(() => {
    getAllQuizCategoriesFromDatabase();
  }, []);

  const handleCloseModal = async () => {
    setIsQuizModalOpen(false);
    const category_id = categories.find(category => category.category_title === newQuizCategory)
    const quizData = {
      owner_id: userData?.id,
      category_id: category_id?.category_id,
      title: newQuizName,
      questions: questions,
    }

    setNewQuizName('')
    setNewQuizCategory('')

    try {
      await axios.post('http://localhost:8000/quiz/create-quiz-questions-answers', quizData)
      console.log("Successfully created quiz, questions, and answers.")
      getAllQuizzesFromDatabase();

    } catch (error) {
      console.log("Error creating quiz, questions, and answers.", error)
    }

  };

  const handleOpenQuizModal = () => {
    setIsQuizModalOpen(true);
  };

  const handleCreateQuiz = () => {
    if (!newQuizName || !newQuizCategory) {
      setErrorMessage("You must fill in all fields");
      return;
    }

    setErrorMessage('')
    setIsQuizModalOpen(false);
    setIsQuestionModalOpen(true);
  };

  const handleCreateQuestion = () => {
    if (!newQuestion || answers.some(answer => !answer) || !correctAnswer) {
      setQuestionErrorMessage("You must fill in all fields");
      return;
    }

    setQuestionErrorMessage('');
    const question = {
      question: newQuestion,
      answers: [
        ...answers.map((answer) => ({ answer, status: false })),
        { answer: correctAnswer, status: true }
      ]
    }

    const new_questions = [...questions, question]
    setQuestions(new_questions)

    setNewQuestion('');
    setAnswers(['', '', '']);
    setCorrectAnswer('');
    setNotificationOpen(true);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  const handleDeleteQuiz = async (quiz_id: number) => {
    try {
      await axios.delete(`http://localhost:8000/quiz/quiz-delete/${quiz_id}`)
      console.log("Quiz successfully deleted.")
      getAllQuizzesFromDatabase();
    } catch (error) {
      console.log("Error deleting quiz: ", error)
    }
  }

  // CHATGPT

  const [openQuizModal, setOpenQuizModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('');

  const handleCloseAIGenerateModal = () => {
    setOpenQuizModal(false)
    setQuizTitle('')
    setQuizCategory('')
  }

  const chatGptGenerateQuiz = async () => {
    const category_id = categories.find(category => category.category_title === quizCategory)
    setOpenQuizModal(false);

    try {
      const responese = await axios.post('http://localhost:8000/generate-chat2', {
        "title": quizTitle,
        "owner_id": userData?.id,
        "category_id": category_id?.category_id
      })
      getAllQuizzesFromDatabase()
      setQuizTitle('')
      setQuizCategory('')

    } catch (error) {
      console.log('CHATGPT', error)
    }
  };

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
        <Container maxWidth="md">

          {/* CONTENT ON THE PAGE */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h2" gutterBottom>
              Doctor's Quizzes
            </Typography>
            <>
              <Box mt={4} display="flex" justifyContent="center" gap={2}>
                <Button variant="contained" color="primary" onClick={handleOpenQuizModal}>
                  Create Quiz
                </Button>
                <Button variant="contained" color="secondary" onClick={() => setOpenQuizModal(true)}>
                  ChatGPT generation
                </Button>
                <Button variant="contained" color="success" onClick={handleOpenCategoryModal}>
                  Create Category
                </Button>
              </Box>
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                {doctorsQuizzes.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body1" align="center" mt={2}>
                      You have no quizzes created yet
                    </Typography>
                  </Grid>
                ) : (
                  doctorsQuizzes.map((quiz) => (
                    <Grid item key={quiz.quiz_id}>
                      <Card
                        sx={{
                          maxWidth: 300,
                          p: 2,
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f5f5' }
                        }}
                        onClick={() => router.push(`/quiz/create-quiz/${quiz.quiz_id}`)}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5" component="h2" color="primary">
                              {quiz.title}
                            </Typography>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                aria-label="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteQuiz(quiz.quiz_id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </>
            <Modal
              open={openQuizModal}
              onClose={() => setOpenQuizModal(false)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  border: '2px solid #000',
                  boxShadow: 24,
                  p: 4,
                }}
              >
                <Typography id="modal-modal-title" variant="h6" component="h2">
                  Create Quiz
                </Typography>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  margin="normal"
                />
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={quizCategory}
                  onChange={(e) => setQuizCategory(e.target.value)}
                  margin="normal"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.category_id} value={category.category_title}>
                      {category.category_title}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="contained" color="primary" onClick={chatGptGenerateQuiz} sx={{ mt: 2 }}>
                  Create
                </Button>
              </Box>
            </Modal>

            {/* Modal for creating a new category */}

            <Modal open={isCategoryModalOpen} onClose={handleCloseCategoryModal}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  width: '50%',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  New Category
                </Typography>
                <TextField
                  label="Category"
                  fullWidth
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  sx={{ mb: 2 }}
                />
                {errorCategoryMessage && (
                  <Typography color="error" sx={{ mt: 1, padding: 1 }}>
                    {errorCategoryMessage}
                  </Typography>
                )}
                <Button variant="contained" color="primary" onClick={handleCreateCategory}>
                  Create
                </Button>
              </Box>
            </Modal>
          </Box>
          {/* END */}

          {/* QUIZ CREATION MODAL */}
          <Modal open={isQuizModalOpen} onClose={handleCloseModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
              }}
            >
              <Typography variant="h4" align="center" gutterBottom>
                Create Quiz
              </Typography>
              <TextField
                label="Quiz Title"
                fullWidth
                value={newQuizName}
                onChange={(e) => setNewQuizName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newQuizCategory}
                  onChange={(e) => setNewQuizCategory(e.target.value)}
                >
                  {categories ? categories.map((category) => (
                    <MenuItem key={category.category_id} value={category.category_title}>
                      {category.category_title}
                    </MenuItem>
                  )) : <div> No category </div>}
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={handleCreateQuiz} fullWidth>
                NEXT
              </Button>
              {errorMessage && (
                <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                  {errorMessage}
                </Typography>
              )}
            </Box>
          </Modal>
          {/* END */}

          {/* QUESTION CREATION MODAL */}
          <Modal open={isQuestionModalOpen} onClose={handleCloseModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                width: '50%',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" gutterBottom>
                  Create Question
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setIsQuestionModalOpen(false);
                    handleCloseModal();
                  }}
                >
                  Finish
                </Button>
              </Box>
              <TextField
                label="Question"
                fullWidth
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                sx={{ mb: 2 }}
              />
              {answers.map((answer, index) => (
                <TextField
                  key={index}
                  label={`Answer ${index + 1}`}
                  fullWidth
                  value={answer}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  sx={{ mb: 2 }}
                />
              ))}
              <TextField
                label="Enter the correct answer here"
                fullWidth
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                sx={{ mb: 2, bgcolor: '#e0f7fa' }}
              />
              <Box position="relative" sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleCreateQuestion} fullWidth>
                  Create Question
                </Button>
                {errorQuestionMessage && (
                  <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                    {errorQuestionMessage}
                  </Typography>
                )}
                <Snackbar
                  open={notificationOpen}
                  autoHideDuration={6000}
                  onClose={handleNotificationClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  sx={{ mb: 2 }} // Dodaj marginu ispod Snackbar-a
                >
                  <Alert onClose={handleNotificationClose} severity="success" sx={{ width: '100%' }}>
                    Successfully created question! Would you like to add more questions?
                  </Alert>
                </Snackbar>
              </Box>
            </Box>
          </Modal>
          {/* END */}

        </Container>
      </div>
      }
    </div>
  );
};

export default CreateQuizPage;
