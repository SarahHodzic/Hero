'use client'
import ListOfQuiz from "@/components/ListOfQuiz";
import QuizCategory from "@/components/QuizCategory";
import SearchBarForQuiz from "@/components/SearchBarForQuiz";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { getCurrentUser, User } from '@/services/getCurrentUser';
import { Box, CircularProgress, Typography } from '@mui/material';



export default function Quiz() {
    const router = useRouter()

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
                const userData = await getCurrentUser(token);
                if (userData && (userData?.role_id === 1 || userData?.role_id === 2 || userData?.role_id === 3)) {
                    setUser(userData);
                    setLoading(false);
                } else {
                    console.log(loading)
                    console.log(userData?.role_id)
                    router.push('/login');
                }
                setUser(userData);
            } catch (error) {

            }
        };
        fetchUser();
    }, []);


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
        ) : (
          <div>
            <SearchBarForQuiz onSearch={setSearchQuery} />
            <QuizCategory onCategorySelect={setSelectedCategory} />
            <ListOfQuiz selectedCategory={selectedCategory} searchQuery={searchQuery} />
          </div>
        )}
      </div>
    )
}