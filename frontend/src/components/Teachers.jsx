import { useEffect, useState } from 'react';
import MainFrame from './ui/MainFrame';
import TeacherCard from './TeacherCard';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import api from "../api";

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await api.get('/auth/teachers');
                console.log(response.data); // This logs the response data
    
                // Access the teachers array from the response
                const formattedTeachers = response.data.teachers.map(teacher => ({
                    name: teacher.teacherName,
                    email: teacher.emailId,
                    joining_date: teacher.startingDate,
                    salary: `${teacher.salary.amount}/month`,
                    timing: `09:00 AM - 05:00 PM`, // Static timing (modify if needed)
                    subjects: teacher.subjects || []
                }));
    
                setTeachers(formattedTeachers);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch teachers');
            } finally {
                setLoading(false);
            }
        };
    
        fetchTeachers();
    }, []); // Empty dependency array ensures it runs only once on mount// Empty dependency array ensures it runs only once on mount

    return (
        <MainFrame>
            <Typography variant="h4" component="h4" sx={{ mb: 4 }}>Teachers</Typography>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Box sx={{
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: 'flex-start',
                    width: '100%',
                    display: "flex"
                }}>
                    {teachers.map((teacher, index) => (
                        <TeacherCard key={index} teacher={teacher} />
                    ))}
                </Box>
            )}
        </MainFrame>
    );
};

export default Teachers;
