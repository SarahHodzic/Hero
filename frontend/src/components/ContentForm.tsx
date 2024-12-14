import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { TextField, Button, Box, Typography } from '@mui/material';
import  { useRouter } from 'next/navigation';
import { Post } from './ContentCard';
type FormValues = {
  title: string;
  user_id: number;
};

interface ContentFormProps {
  user_id: number;
  onContentAdded: (newContent: Post) => void;
}

const ContentForm: React.FC<ContentFormProps> = ({ user_id ,onContentAdded }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
    const router = useRouter()


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const response = await axios.post('http://localhost:8000/contents/', { ...data, user_id });
      onContentAdded(response.data)
    } catch (error) {

    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }} >
      

      <TextField
        label="Title"
        fullWidth
        variant="outlined"
        {...register('title', { required: true })}
        error={!!errors.title}
        helperText={errors.title ? 'Title is required.' : ''}
        sx={{ mb: 2 }}
      />
      


      <Button type="submit" variant="contained" color="primary">
        Create Post
      </Button>
    </Box>
  );
};

export default ContentForm;
