import axios from 'axios';

export interface User {
  id: number;
  name: string;
  lastname: string;
  role_id: number;
  email: string;
}

export async function getCurrentUser(token: string | null): Promise<User | null> {
  try {
   
    const response = await axios.get<User>('http://localhost:8000/auth/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data;
  } catch (error) {
    return null;
  }
}