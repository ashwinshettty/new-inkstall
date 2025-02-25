import React from 'react'
import MainFrame from './ui/MainFrame'
import TeacherCard from './TeacherCard'
import { Box, Typography } from '@mui/material'

const Teachers = () => {
    const teachers = [
        {name: "Inkstall", email: "inkstall@gmail.com", joining_date: "February 12, 2025", salary: "30000/month", timing:"9:00 AM - 5:00 PM", subjects: ["Physics", "Accounting", "Mandarin Chinese"]},
        {name: "Ash", email: "ash4@gmail.com", joining_date: "February 19, 2025", salary: "19999/month", timing:"9:00 AM - 5:00 PM", subjects: ["Physics", "Accounting", "Mandarin Chinese"]},
        {name: "Beenish", email: "beenish@gmail.com", joining_date: "March 17, 2025", salary: "30000/month", timing:"9:00 AM - 5:00 PM", subjects: ["Physics", "Accounting", "Mandarin Chinese"]},
        {name: "Beenish", email: "beenish@gmail.com", joining_date: "March 17, 2025", salary: "30000/month", timing:"9:00 AM - 5:00 PM", subjects: ["Physics", "Accounting", "Mandarin Chinese"]}
    ]

    return (
        <MainFrame>
            <Typography variant="h4" component="h4" sx={{ mb: 4 }}>Teachers</Typography>
            <Box sx={{
                // display: 'flex',
                flexWrap: 'wrap',
                gap: 2      ,
                justifyContent: 'flex-start',
                width: '100%',
                display:"flex"
                // p: 2
            }}>
                {teachers.map((teacher, index) => (
                        <TeacherCard  key={index} teacher={teacher} />
                ))}
            </Box>
        </MainFrame>
    )
}

export default Teachers
