import { Close } from '@mui/icons-material';
import { Autocomplete, Box, Button, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BsUpload } from "react-icons/bs";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import MainFrame from './ui/MainFrame';

const TestSubmission = () => {
  // Format date for display
  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/\s/g, ' ');
  };
  
  // Today's date for submission date
  const today = new Date();
  const todayFormatted = formatDate(today);
  
  // States for form fields
  const [submissionDate, setSubmissionDate] = useState(todayFormatted);
  const [proposedTestDate, setProposedTestDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [chapters, setChapters] = useState(['']);
  
  // State for selected students
  const [selectedStudents, setSelectedStudents] = useState([{ 
    student: '', 
    selectedGrade: '',
    selectedBoard: ''
  }]);

  // Sample student data
  const allStudentsList = [
    { 
      name: 'Sanjay - DSRV (2undefined)', 
      grade: '2',
      board: 'IGCSE'
    },
    { 
      name: 'Jane Smith', 
      grade: '5',
      board: 'CBSE'
    },
    { 
      name: 'John Doe', 
      grade: '8',
      board: 'ICSE'
    },
    { 
      name: 'Emily Johnson', 
      grade: '10',
      board: 'CBSE'
    },
    { 
      name: 'Michael Brown', 
      grade: '7',
      board: 'IGCSE'
    }
  ];

  // Subject options
  const subjectOptions = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography',
    'Computer Science'
  ];

  // Handle adding a new student
  const handleAddStudent = () => {
    setSelectedStudents([...selectedStudents, { student: '', selectedGrade: '', selectedBoard: '' }]);
  };

  // Handle removing a student
  const handleRemoveStudent = (index) => {
    const updatedStudents = [...selectedStudents];
    updatedStudents.splice(index, 1);
    setSelectedStudents(updatedStudents);
  };

  // Handle student selection
  const handleStudentChange = (index, newValue) => {
    const updatedStudents = [...selectedStudents];
    if (newValue) {
      updatedStudents[index] = {
        student: newValue.name,
        selectedGrade: newValue.grade,
        selectedBoard: newValue.board
      };
    } else {
      updatedStudents[index] = { student: '', selectedGrade: '', selectedBoard: '' };
    }
    setSelectedStudents(updatedStudents);
  };

  // Handle adding a new chapter
  const handleAddChapter = () => {
    setChapters([...chapters, '']);
  };

  // Handle removing a chapter
  const handleRemoveChapter = (index) => {
    const updatedChapters = [...chapters];
    updatedChapters.splice(index, 1);
    setChapters(updatedChapters);
  };

  // Handle chapter input change
  const handleChapterChange = (index, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = value;
    setChapters(updatedChapters);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      submissionDate,
      proposedTestDate,
      totalMarks,
      selectedStudents,
      subject,
      chapters,
      notes
    });
    // Add API call here to submit the form data
  };

  return (
    <MainFrame>
      <Box sx={{ p: 3, width: '70%', position: 'relative', left: '50%', transform: 'translateX(-50%)', border: '1px solid #ccc', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IoMdCheckmarkCircleOutline size={32} color='#0000eb' />
          <Typography variant="h6" component="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>Test Submission Form</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Submission Date */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Typography variant="body1" component="label">
                Submission Date
              </Typography>
              <TextField
                fullWidth
                value={submissionDate}
                readOnly
              />
            </Box>

            {/* Proposed Test Date */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Proposed Test Date <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={proposedTestDate}
                onChange={(e) => setProposedTestDate(e.target.value)}
                required
              />
            </Box>

            {/* Total Marks */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Total Marks (20-140) <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                type="number"
                inputProps={{ min: 20, max: 140 }}
                required
              />
            </Box>

            {/* Students */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" component="label" required>
                  Students <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleAddStudent}
                  startIcon={<span>+</span>}
                  size="small"
                  sx={{ 
                    bgcolor: '#4285F4', 
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#3367d6',
                    }
                  }}
                >
                  Add Student
                </Button>
              </Box>
              
              {selectedStudents.map((student, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Autocomplete
                    options={allStudentsList}
                    getOptionLabel={(option) => option.name || ''}
                    value={student.student ? allStudentsList.find(s => s.name === student.student) || null : null}
                    onChange={(event, newValue) => handleStudentChange(index, newValue)}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select or search student..." fullWidth />
                    )}
                    sx={{ flex: 1 }}
                  />
                  
                  {/* Display selected grade */}
                  {student.selectedGrade && (
                    <Box sx={{ 
                      p: 1, 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      bgcolor: '#f5f5f5',
                      minWidth: '60px',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2">
                        Grade {student.selectedGrade}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Remove student button */}
                  {selectedStudents.length > 1 && (
                    <IconButton onClick={() => handleRemoveStudent(index)}>
                      <Close />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>

            {/* Subject */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Subject <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Autocomplete
                options={subjectOptions}
                value={subject}
                onChange={(event, newValue) => setSubject(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select Subject" 
                    required
                  />
                )}
                fullWidth
              />
            </Box>

            {/* Chapter Name(s) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" component="label" required>
                  Chapter Name(s) <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleAddChapter}
                  startIcon={<span>+</span>}
                  size='small'
                  sx={{ 
                    bgcolor: '#4285F4', 
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#3367d6',
                    }
                  }}
                >
                  Add Chapter
                </Button>
              </Box>
              
              {chapters.map((chapter, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    placeholder="Enter chapter name"
                    value={chapter}
                    onChange={(e) => handleChapterChange(index, e.target.value)}
                    required
                  />
                  
                  {/* Remove chapter button */}
                  {chapters.length > 1 && (
                    <IconButton onClick={() => handleRemoveChapter(index)}>
                      <Close />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>

            {/* Notes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Notes <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </Box>

            {/* Upload Test File */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Upload Test File <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<BsUpload />}
                sx={{ 
                  width: 'fit-content', 
                  borderColor: '#e0e0e0',
                  color: '#333',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#4285F4',
                  }
                }}
              >
                Upload File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </Button>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                size='small'
                sx={{ 
                  bgcolor: '#4285F4', 
                  color: 'white',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#3367d6',
                  }
                }}
              >
                Submit Test
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </MainFrame>
  );
};

export default TestSubmission;