import React, { useState, useEffect } from 'react';
import MainFrame from './ui/MainFrame';
import { Box, Typography, Button, Autocomplete, TextField, IconButton, MenuItem, Select, FormControl, InputLabel, TextareaAutosize } from '@mui/material';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Close } from '@mui/icons-material'; // Import the close icon
import { FiCheck, FiX, FiFileText } from 'react-icons/fi'; // Import icons for K-Sheet options

const DailyUpdates = () => {
  const [kSheetGiven, setKSheetGiven] = useState('No');
  const [chapterCompletion, setChapterCompletion] = useState('25%');
  const [subject, setSubject] = useState('');
  const [chapterName, setChapterName] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Format date options
  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/\s/g, ' ');
  };
  
  // Get today and yesterday dates
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayFormatted = formatDate(today);
  const yesterdayFormatted = formatDate(yesterday);
  
  const todayOption = `Today (${todayFormatted})`;
  const yesterdayOption = `Yesterday (${yesterdayFormatted})`;
  
  const [date, setDate] = useState(todayOption);

  const [selectedStudents, setSelectedStudents] = useState([{ 
    student: '', 
    selectedGrade: '',
    selectedBoard: ''
  }]);

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
    // Add more students here
  ];

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    // Add more subjects as needed
  ];

  const handleStudentChange = (index, value) => {
    const updatedStudents = [...selectedStudents];
    const selectedStudent = allStudentsList.find(s => s.name === value);
    
    updatedStudents[index] = { 
      student: value,
      selectedGrade: selectedStudent ? selectedStudent.grade : '',
      selectedBoard: selectedStudent ? selectedStudent.board : ''
    };
    
    setSelectedStudents(updatedStudents);
  };

  const handleGradeChange = (index, value) => {
    const updatedStudents = [...selectedStudents];
    updatedStudents[index].selectedGrade = value;
    setSelectedStudents(updatedStudents);
  };
  
  const handleBoardChange = (index, value) => {
    const updatedStudents = [...selectedStudents];
    updatedStudents[index].selectedBoard = value;
    setSelectedStudents(updatedStudents);
  };

  const addStudentField = () => {
    setSelectedStudents([...selectedStudents, { 
      student: '',
      selectedGrade: '',
      selectedBoard: '' 
    }]);
  };

  const deleteStudentField = (index) => {
    if (selectedStudents.length > 1) {
      const updatedStudents = selectedStudents.filter((_, i) => i !== index);
      setSelectedStudents(updatedStudents);
    }
  };

  const getAvailableStudents = (index) => {
    return allStudentsList.filter(
      (student) =>
        !selectedStudents.some(
          (sel, i) => i !== index && sel.student === student.name
        )
    );
  };

  return (
    <MainFrame>
      <Box sx={{ width: 'fit-content', minWidth: '70%', p: 2, position: 'relative', left: '50%', transform: 'translateX(-50%)', border: '1px solid #d3d3d3', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IoMdCheckmarkCircleOutline size={32} color='#0000eb' />
          <Typography variant="h6" component="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>Daily Update Form</Typography>
        </Box>

        <Box component="form" sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {selectedStudents.map((student, index) => (
              <Box key={index} sx={{ gap: 1, display: 'flex', flexDirection: 'column', border: '1px solid #d3d3d3', borderRadius: '8px', p: 2, pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" component="p">Student {index + 1}*</Typography>
                  {selectedStudents.length > 1 && (
                    <IconButton
                      onClick={() => deleteStudentField(index)}
                      sx={{ color: 'red' }}
                    >
                      <Close />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <Autocomplete
                    fullWidth
                    options={getAvailableStudents(index)}
                    getOptionLabel={(option) => option.name}
                    value={allStudentsList.find((s) => s.name === student.student) || null}
                    onChange={(event, newValue) => handleStudentChange(index, newValue ? newValue.name : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select or search student..."
                        required
                      />
                    )}
                  />

                  {/* Show Grade and Board when student is selected */}
                  {student.student && (
                    <Box sx={{ display: 'flex', width: '100%', gap: 2, mt: 1, justifyContent: 'space-evenly' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" component="p" sx={{ mb: 0.5 }}>
                          Grade
                        </Typography>
                        <Box 
                          sx={{ 
                            bgcolor: '#f9f9f9', 
                            p: 1.5, 
                            border: '1px solid #d3d3d3', 
                            borderRadius: '4px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {student.selectedGrade}
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" component="p" sx={{ mb: 0.5 }}>
                          Board
                        </Typography>
                        <Box 
                          sx={{ 
                            bgcolor: '#f9f9f9', 
                            p: 1.5, 
                            border: '1px solid #d3d3d3', 
                            borderRadius: '4px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {student.selectedBoard}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={addStudentField}
              sx={{ mt: 2, alignSelf: 'flex-start' }}
            >
              + Add another student
            </Button>

            {/* Subject Dropdown */}
            <FormControl fullWidth required>
              <InputLabel id="subject-label">Subject</InputLabel>
              <Select
                labelId="subject-label"
                value={subject}
                label="Subject *"
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjects.map((subj) => (
                  <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Chapter Name */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" htmlFor="chapter-name">
                Chapter Name *
              </Typography>
              <TextField
                id="chapter-name"
                fullWidth
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                required
              />
            </Box>

            {/* Notes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" htmlFor="notes">
                Notes *
              </Typography>
              <TextareaAutosize
                id="notes"
                fullWidth
                minRows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                style={{ border: '1px solid #d3d3d3', borderRadius: '8px' }}
              />
            </Box>

            {/* Date */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" htmlFor="date">
                Date
              </Typography>
              <Select
                id="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
              >
                <MenuItem value={todayOption}>{todayOption}</MenuItem>
                <MenuItem value={yesterdayOption}>{yesterdayOption}</MenuItem>
              </Select>
            </Box>
            {/* K-Sheet Given */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Typography variant="body1" component="label">
                K-Sheet Given
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box 
                  onClick={() => setKSheetGiven('No')}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    p: 2, 
                    border: kSheetGiven === 'No' ? '2px solid #ffcc00' : '2px solid #f5f5f5', 
                    borderRadius: '8px',
                    bgcolor: kSheetGiven === 'No' ? '#fffdaf' : '#f5f5f5',
                    cursor: 'pointer',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bgcolor: kSheetGiven === 'No' ? '#ffcc00' : 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    border: kSheetGiven === 'No' ? '2px solid #ffcc00' : '2px solid #e0e0e0'
                  }}>
                    <FiX size={24} color={kSheetGiven === 'No' ? 'white' : '#e0e0e0'} />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: kSheetGiven === 'No' ? '#ffcc00' : '#444444' }}>No</Typography>
                </Box>
            
                <Box 
                  onClick={() => setKSheetGiven('Textual')}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    p: 2, 
                    border: kSheetGiven === 'Textual' ? '2px solid #ffcc00' : '2px solid #f5f5f5', 
                    borderRadius: '8px',
                    bgcolor: kSheetGiven === 'Textual' ? '#fffdaf' : '#f5f5f5',
                    cursor: 'pointer',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bgcolor: kSheetGiven === 'Textual' ? '#ffcc00' : 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    border: kSheetGiven === 'Textual' ? '2px solid #ffcc00' : '2px solid #e0e0e0'
                  }}>
                    <FiFileText size={24} color={kSheetGiven === 'Textual' ? 'white' : '#e0e0e0'} />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: kSheetGiven === 'Textual' ? '#ffcc00' : '#444444' }}>Textual</Typography>
                </Box>
            
                <Box 
                  onClick={() => setKSheetGiven('Yes')}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    p: 2, 
                    border: kSheetGiven === 'Yes' ? '2px solid #ffcc00' : '2px solid #f5f5f5', 
                    borderRadius: '8px',
                    bgcolor: kSheetGiven === 'Yes' ? '#fffdaf' : '#f8f8f8',
                    cursor: 'pointer',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bgcolor: kSheetGiven === 'Yes' ? '#ffcc00' : 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    border: kSheetGiven === 'Yes' ? '2px solid #ffcc00' : '2px solid #e0e0e0'
                  }}>
                    <FiCheck size={24} color={kSheetGiven === 'Yes' ? 'white' : '#e0e0e0'} />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: kSheetGiven === 'Yes' ? '#ffcc00' : '#444444' }}>Yes</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Upload K-Sheet section - only visible when "Yes" is selected */}
            {kSheetGiven === 'Yes' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                  Upload K-Sheet
                </Typography>
                <Box 
                  sx={{
                    border: '1px dashed #d3d3d3', 
                    borderRadius: '8px', 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    height: '100px',
                    width: '50%',
                    position: 'relative',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    '&:hover': {
                      border: '1px dashed #ffcc00',
                    }
                  }}
                >
                  <Box 
                    component="label" 
                    htmlFor="upload-ksheet" 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center'
                    }}
                  >
                    <input
                      id="upload-ksheet"
                      type="file"
                      accept=".doc,.docx,.pdf,.jpeg,.jpg,.png"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}
                    >
                      {uploadedFile ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#4CAF50"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 16L12 8" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 11L12 8 15 11" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </Box>
                    <Typography variant="body1" sx={{ color: '#ffcc00', fontWeight: 'medium', textAlign: 'center' }}>
                      {uploadedFile ? uploadedFile.name : 'Upload a file'}
                    </Typography>
                    {!uploadedFile && (
                      <Typography variant="caption" sx={{ color: '#9e9e9e', textAlign: 'center', mt: 0.5 }}>
                        DOC, DOCX, PDF, JPEG, PNG up to 10MB
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
            
            {/* Chapter Completion */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Typography variant="body1" component="label">
                Chapter Completion
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box 
                  onClick={() => setChapterCompletion('25%')}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bgcolor: ['25%', '50%', '75%', '100%'].indexOf(chapterCompletion) >= 0 ? '#4a6bdf' : '#e0e0e0',
                    color: ['25%', '50%', '75%', '100%'].indexOf(chapterCompletion) >= 0 ? 'white' : 'black',
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    25%
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: chapterCompletion === '25%' ? '#4a6bdf' : 'inherit' }}>Started</Typography>
                </Box>
            
                <Box 
                  onClick={() => setChapterCompletion('50%')}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bgcolor: ['50%', '75%', '100%'].indexOf(chapterCompletion) >= 0 ? '#4a6bdf' : '#e0e0e0',
                    color: ['50%', '75%', '100%'].indexOf(chapterCompletion) >= 0 ? 'white' : 'black',
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    50%
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: chapterCompletion === '50%' ? '#4a6bdf' : 'inherit' }}>Halfway</Typography>
                </Box>
            
                <Box 
                  onClick={() => setChapterCompletion('75%')}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bgcolor: ['75%', '100%'].indexOf(chapterCompletion) >= 0 ? '#4a6bdf' : '#e0e0e0',
                    color: ['75%', '100%'].indexOf(chapterCompletion) >= 0 ? 'white' : 'black',
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    75%
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: chapterCompletion === '75%' ? '#4a6bdf' : 'inherit'}}>Almost Done</Typography>
                </Box>
            
                <Box 
                  onClick={() => setChapterCompletion('100%')}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bgcolor: chapterCompletion === '100%' ? '#4a6bdf' : '#e0e0e0',
                    color: chapterCompletion === '100%' ? 'white' : 'black',
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    100%
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: chapterCompletion === '100%' ? '#4a6bdf' : 'inherit' }}>Complete</Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Submit Button */}
            <Button
              variant="contained"
              sx={{ 
                mt: 3, 
                bgcolor: '#ffcc00', 
                color: 'white', 
                '&:hover': { bgcolor: '#e6b800' },
                py: 1.5,
                fontWeight: 'bold'
              }}
              startIcon={<IoMdCheckmarkCircleOutline />}
              fullWidth
            >
              Submit Update
            </Button>
          </Box>
        </Box>
      </Box>
    </MainFrame>
  );
};

export default DailyUpdates;