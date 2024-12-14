import { Box, Button, Container, Grid } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

type Category = {
  category_id: number;
  category_title: string;
};

interface QuizCategoryProps {
  onCategorySelect: (category: number | null) => void;
}

const QuizCategory: React.FC<QuizCategoryProps> = ({ onCategorySelect }) => {

  const [categories, setCategories] = useState<Category[]>([]);

  // We are fetching a list of categories from the database that we want to display on the page.
  useEffect(() => {
    async function getAllQuizCategoriesFromDatabase() {
      try {
        const response = await axios.get('http://localhost:8000/quiz/categories');
        setCategories(response.data);
        console.log("Kategorije kvizova")
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching quiz categories:', error);
      }
    }

    getAllQuizCategoriesFromDatabase();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 4,
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button onClick={() => onCategorySelect(null)} variant="contained">All</Button>
          </Grid>
          {categories.map((category, index) => (
            <Grid item key={index}>
              <Button onClick={() => onCategorySelect(category.category_id)} variant="contained">{category.category_title}

              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};


export default QuizCategory;