'use client'
import React, { useState, useEffect } from 'react';
import { Container, CircularProgress, Typography, Box, Button, Card, CardContent, CardActions, Modal, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon, Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import { getCurrentUser, User } from '@/services/getCurrentUser';
import { useRouter } from 'next/navigation'

interface QuizData {
  quiz_id: number;
  title: string;
  questions: Question[];
}

interface UpdatedAnswer {
  answer_id: number;  // Tip podataka za ID odgovora (pretpostavljamo da je number)
  answer: string;     // Tekstualni odgovor
  status: boolean;    // Status odgovora (true/false)
}

interface UpdatedQuestionData {
  question_id: number;            // Tip podataka za ID pitanja (pretpostavljamo da je number)
  question: string;               // Tekst pitanja
  answers: UpdatedAnswer[];       // Niz objekata koji odgovaraju interfejsu UpdatedAnswer
}

interface Answer {
  answer_id: number;
  answer: string;
  status: boolean;
}

interface Question {
  question_id: number;
  question: string;
  answers: Answer[]
}

const EditQuizPage = ({ params }: { params: { quiz_id: string } }) => {
  const router = useRouter()

  const [open, setOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [answers, setAnswers] = useState<Answer[] | null>(['', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editErrorMessage, setEditErrorMessage] = useState('');
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

  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const getOneQuizFromDatabase = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/quiz/find-quiz/${params.quiz_id}`);
      setQuizData(response.data);
    } catch (error) {
      console.error("Error while retrieving a quiz from the database:", error);
    }
  };

  // DELETING QUESTIONS
  const handleDeleteQuestionFromDatabase = async (question_id: number) => {
    try {
      await axios.delete(`http://localhost:8000/quiz/delete-question/${question_id}`);
      await getOneQuizFromDatabase();
    } catch (error) {
      console.error("Error while deleting questions:", error);
    }
  };

  // EDITING
  // OPENING EDIT MODAL
  const handleEdit = (question: Question) => {
    setCurrentQuestion(question);
    console.log(currentQuestion)
    setOpen(true);
  };

  // CLOSING EDIT MODAL
  const handleClose = () => {
    setOpen(false);
    setErrorMessage('');
    setCurrentQuestion(null);
  };

  // SETTING NEW ANSWERS BEFORE SUBMITTING
  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = currentQuestion?.answers ? [...currentQuestion.answers] : [];
    newAnswers[index] = { ...newAnswers[index], answer: value }; // Ažuriranje samo atributa `answer`
    setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
  };

  // UPDATING QUESTION AND ANSWER DATA IN THE DATABASE
  const handleEditQuestionInDatabase = async (question_id: number) => {


    if (!currentQuestion?.question.trim() || !currentQuestion?.answers.every(answer => answer.answer.trim())) {
      // Ako nisu, postavite poruku o grešci
      setEditErrorMessage("You must fill in all fields.");
      return;
    }
    handleClose();
    const updatedAnswers: UpdatedAnswer[] = currentQuestion.answers.map(({ answer_id, answer, status }) => ({
      answer_id,
      answer,
      status
    }));

    const updatedQuestionData: UpdatedQuestionData = {
      question_id: currentQuestion.question_id, // Jedinstveni identifikator pitanja koje želite ažurirati
      question: currentQuestion.question, // Tekst pitanja koje želite ažurirati
      answers: updatedAnswers // Lista objekata sa samo tri atributa
    };

    console.log(updatedQuestionData)
    try {
      const response = await axios.put(`http://localhost:8000/quiz/update-question/${question_id}`, updatedQuestionData)
      console.log("Successfully update the question and answers.")
      await getOneQuizFromDatabase();
      setEditErrorMessage('');

    } catch (error) {
      console.error("Error while updating the question: ", error);
    }
  };

  // CREATING QUESTIONS FOR THE QUIZ AND ITS ANSWERS
  const handleCreateQuestion = async () => {
    if (!newQuestion.trim() || !answers?.every(answer => answer.trim()) || !correctAnswer.trim()) {
      setErrorMessage("You must fill in all fields");
      return;
    }

    const payload = {
      quiz_id: quizData?.quiz_id,
      question: newQuestion,
      answers: [
        ...answers.map((answer) => ({ answer, status: false })),
        { answer: correctAnswer, status: true }
      ],
    };

    try {
      const response = await axios.post(`http://localhost:8000/quiz/create-question-and-answers/${params.quiz_id}`, payload);
      await getOneQuizFromDatabase();
      setErrorMessage('');

      // Close the modal and reset the form.
      setIsQuestionModalOpen(false);
      setNewQuestion('');
      setAnswers(['', '', '']);
      setCorrectAnswer('');
    } catch (error) {
      console.error(error);
    }
  };



  // Whenever the page loads, data is fetched from the database.
  useEffect(() => {
    getOneQuizFromDatabase();
  }, [params.quiz_id]);

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
        <Container >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h3"> Quiz: {quizData?.title} </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsQuestionModalOpen(true)}>
              Add Question
            </Button>
          </Box>

          {/* THE CONTENT OF THE PAGE WHEN IT LOADS WITH A LIST OF ALL QUESTIONS */}
          <Box sx={{ marginBottom: '100px' }}>
            {quizData && quizData.questions ? (
              quizData.questions.map((question, index) => (
                <Card key={question.question_id} sx={{ mb: 2 }}>
                  <Box sx={{ backgroundColor: '#f5f5f5', padding: 1 }}>
                    <Typography variant="h5">{`${index + 1}. ${question.question}`}</Typography>
                  </Box>
                  <CardContent>
                    <ul>
                      {question.answers.map((answer: Answer) => (
                        <li
                          key={answer.answer_id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: answer.status ? 'green' : 'black',
                          }}
                        >
                          {answer.answer}
                          {answer.status ? (
                            <CheckIcon sx={{ color: 'green', ml: 1 }} />
                          ) : (
                            <CloseIcon sx={{ color: 'red', ml: 1 }} />
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardActions>
                    <IconButton size="small" onClick={() => handleEdit(question)}>
                      <EditIcon />
                    </IconButton>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteQuestionFromDatabase(question.question_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography variant="h6">No questions available.</Typography>
            )}
          </Box>
          {/* END */}


          {/* EDIT FORM FOR QUESTIONS AND ANSWERS */}
          {currentQuestion && (
            <Modal open={open} onClose={handleClose}>
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
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h4" gutterBottom>
                    Edit Question
                  </Typography>
                  <Button onClick={() => handleClose()}>
                    <CloseIcon />
                  </Button>
                </Box>
                <TextField
                  label="Question"
                  fullWidth
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
                {currentQuestion.answers.map((answer, index) => (
                  <TextField
                    key={index}
                    label={`Answer ${index + 1}`}
                    fullWidth
                    value={answer.answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    multiline
                    rows={2}
                    sx={{
                      mb: 2,
                      backgroundColor: answer.status ? 'rgba(144, 238, 144, 0.7)' : 'rgba(255, 99, 71, 0.3)',
                    }}

                  />
                ))}
                <Button variant="contained" color="primary" onClick={() => handleEditQuestionInDatabase(currentQuestion.question_id)} fullWidth>
                  Submit
                </Button>
                {editErrorMessage && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {editErrorMessage}
                  </Typography>
                )}
              </Box>
            </Modal>
          )}
          {/* END */}


          {/* MODAL FOR CREATING QUESTIONS */}
          <Modal open={isQuestionModalOpen}>
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
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h4" gutterBottom>
                  Quiz: {quizData?.title}
                </Typography>
                <Button onClick={() => setIsQuestionModalOpen(false)}>
                  <CloseIcon />
                </Button>
              </Box>
              <TextField
                label="Question"
                fullWidth
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                sx={{ mb: 2 }}
              />
              {answers?.map((answer, index) => (
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
              <Box position="relative">
                <Button variant="contained" color="primary" onClick={handleCreateQuestion} fullWidth>
                  Create Question
                </Button>
                {errorMessage && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {errorMessage}
                  </Typography>
                )}
              </Box>
            </Box>
          </Modal>
          {/* END */}

        </Container>
      </div>
      }
    </div>

  );
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: 'auto',
};


export default EditQuizPage;






