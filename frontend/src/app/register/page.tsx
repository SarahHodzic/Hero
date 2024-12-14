"use client"
import { useForm, SubmitHandler } from 'react-hook-form';
import { FormControlLabel, Checkbox,TextField, Button, Box, Typography, Container, Link } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface IFormInput {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role_id: boolean
}

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<IFormInput>({
    defaultValues: {role_id: false}
  });
  const role_id = watch('role_id');
  const router = useRouter();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
        
        
        const { email, lastname, name, password, role_id } = data;
        const newData = {
          email,
          lastname,
          name,
          password,
          role_id: role_id ? 2 : 1
        };

      const response = await axios.post('http://localhost:8000/auth/users/', newData);
      console.log('User registered:', response.data);
      router.push('/login');
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('role_id', event.target.checked);
  };

  return (
   
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ 
            p: 3,                
            boxShadow: 3,        
            border: '2px ', 
            borderColor: 'grey.500',
            borderRadius: 2,
            mt: 5, maxWidth: 500, mx: 'auto', }}
      >
        <Box sx={{ paddingX: 0, display:'flex', justifyContent:'space-between'}}>
          <Typography variant="h5" component="h1" gutterBottom>
            Register
          </Typography>

          <Link href="/">
            <Button sx={{color:'secondary.main'}}>Home</Button>
          </Link>
        </Box>
        <TextField
          fullWidth
          margin="normal"
          label="First Name"
          {...register('name', { required: 'First name is required' })}
          error={!!errors.name}
          helperText={errors.name ? errors.name.message : ''}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Last Name"
          {...register('lastname', { required: 'Last name is required' })}
          error={!!errors.lastname}
          helperText={errors.lastname ? errors.lastname.message : ''}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          {...register('email', { 
            required: 'Email is required', 
            pattern: { value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, message: 'Invalid email address' } 
          })}
          error={!!errors.email}
          helperText={errors.email ? errors.email.message : ''}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          {...register('password', { required: 'Password is required' })}
          error={!!errors.password}
          helperText={errors.password ? errors.password.message : ''}
        />
        <FormControlLabel
          control={
            <Checkbox
              {...register('role_id')}
              onChange={handleCheckboxChange}
              checked={role_id}
            />
          }
          label="Are you registering as a professional user?"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Register
        </Button>
        
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Already registered?{' '}
        <Link href="/login">
          <Button variant="text">Login</Button>
        </Link>
      </Typography>
      
      </Box>

  );
};

export default Register;
