import { Close } from '@mui/icons-material';
import { Autocomplete, Box, Button, IconButton, TextField, Typography, Snackbar, Alert } from '@mui/material';
import React, { useState, useContext } from 'react';
import { BsUpload } from "react-icons/bs";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import MainFrame from './ui/MainFrame';
import axios from 'axios';
import { StudentsContext } from '../context/StudentContext';
import { SubjectsContext } from '../context/SubjectsContext';

const TestSubmission = () => {
  // Date formatting utility
  const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/\s/g, ' ');
  };

  // Today's date for submission date
  const today = new Date();
  const todayFormatted = formatDate(today);

  // Form state for test submission
  const [submissionDate] = useState(todayFormatted);
  const [proposedTestDate, setProposedTestDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [subject, setSubject] = useState('');
  const [chapters, setChapters] = useState([{ chapterName: '' }]);
  const [notes, setNotes] = useState('');
  const [uploadTestFileUrl, setUploadTestFileUrl] = useState('');

  // Selected students state (initially empty)
  const [selectedStudents, setSelectedStudents] = useState([{ name: '', grade: '' }]);

  // Alert states
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  // Use contexts for students and subjects
  const { students, loading: studentsLoading } = useContext(StudentsContext);
  const { subjects, loading: subjectsLoading } = useContext(SubjectsContext);

  // Handlers for students
  const handleAddStudent = () => {
    setSelectedStudents([...selectedStudents, { name: '', grade: '' }]);
  };

  const handleRemoveStudent = (index) => {
    const updatedStudents = [...selectedStudents];
    updatedStudents.splice(index, 1);
    setSelectedStudents(updatedStudents);
  };

  const handleStudentChange = (index, newValue) => {
    const updatedStudents = [...selectedStudents];
    if (newValue) {
      updatedStudents[index] = {
        name: newValue.name,
        grade: newValue.grade
      };
    } else {
      updatedStudents[index] = { name: '', grade: '' };
    }
    setSelectedStudents(updatedStudents);
  };

  const handleGradeChange = (index, value) => {
    const updatedStudents = [...selectedStudents];
    updatedStudents[index].grade = value;
    setSelectedStudents(updatedStudents);
  };

  // Handlers for chapters
  const handleAddChapter = () => {
    setChapters([...chapters, { chapterName: '' }]);
  };

  const handleRemoveChapter = (index) => {
    const updatedChapters = [...chapters];
    updatedChapters.splice(index, 1);
    setChapters(updatedChapters);
  };

  const handleChapterChange = (index, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index].chapterName = value;
    setChapters(updatedChapters);
  };

  // Simulate file upload (replace with your upload logic)
  const handleFileUpload = (file) => {
    if (file) {
      // Here you might want to upload the file and get a URL
      const fakeUrl = `https://example.com/${file.name}`;
      setUploadTestFileUrl(fakeUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      proposedDate: new Date(proposedTestDate).toISOString(),
      totalMarks: parseInt(totalMarks),
      students: selectedStudents,
      subject: {
        name: subject,
        chapters: chapters,
        notes: notes || "",
        uploadTestFileUrl: uploadTestFileUrl || ""
      }
    };

    console.log("Sending data to backend:", JSON.stringify(formData, null, 2));

    try {
      const response = await axios.post('http://localhost:4000/api/test-submissions', formData);

      setAlertMessage('Test submission created successfully!');
      setAlertSeverity('success');
      setOpenAlert(true);

      // Reset form
      setProposedTestDate('');
      setTotalMarks('');
      setSubject('');
      setChapters([{ chapterName: '' }]);
      setNotes('');
      setUploadTestFileUrl('');
      setSelectedStudents([{ name: '', grade: '' }]);

      console.log('Submission successful:', response.data);
    } catch (error) {
      setAlertMessage(`Error: ${error.response?.data?.message || 'Failed to submit test'}`);
      setAlertSeverity('error');
      setOpenAlert(true);
      console.error('Submission error:', error);
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setOpenAlert(false);
  };

  // Date formatting for proposed test date options (if needed)
  // Here you can add additional date handling if required

  // If either context is loading, show a loading indicator
  if (studentsLoading || subjectsLoading) return <div>Loading...</div>;

  return (
    <MainFrame>
      <Box sx={{ p: 3, width: '70%', position: 'relative', left: '50%', transform: 'translateX(-50%)', border: '1px solid #ccc', borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IoMdCheckmarkCircleOutline size={32} color='#0000eb' />
          <Typography variant="h6" component="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
            Test Submission Form
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Submission Date */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Typography variant="body1" component="label">
                Submission Date
              </Typography>
              <TextField fullWidth value={submissionDate} readOnly />
            </Box>

            {/* Proposed Test Date */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Proposed Test Date <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField fullWidth type="date" value={proposedTestDate} onChange={(e) => setProposedTestDate(e.target.value)} required />
            </Box>

            {/* Total Marks */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Total Marks (20-140) <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField fullWidth value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} type="number" inputProps={{ min: 1 }} required />
            </Box>

            {/* Students */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" component="label" required>
                  Students <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Button variant="contained" onClick={handleAddStudent} startIcon={<span>+</span>} size="small" sx={{ bgcolor: '#4285F4', color: 'white', '&:hover': { bgcolor: '#3367d6' } }}>
                  Add Student
                </Button>
              </Box>
              {selectedStudents.map((student, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Autocomplete
                    options={students}
                    getOptionLabel={(option) => option.name || ''}
                    value={student.name ? students.find(s => s.name === student.name) || null : null}
                    onChange={(event, newValue) => handleStudentChange(index, newValue)}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select or search student..." fullWidth required />
                    )}
                    sx={{ flex: 1 }}
                  />
                  {/* Grade input */}
                  <TextField
                    placeholder="Grade"
                    value={student.grade}
                    onChange={(e) => handleGradeChange(index, e.target.value)}
                    sx={{ width: '100px' }}
                    required
                  />
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
                options={subjects}
                getOptionLabel={(option) => option.name || ''}
                value={subject ? subjects.find(s => s.name === subject) || null : null}
                onChange={(event, newValue) => setSubject(newValue ? newValue.name : '')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Subject" required />
                )}
                fullWidth
              />
            </Box>

            {/* Chapters */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" component="label" required>
                  Chapters <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Button variant="contained" onClick={handleAddChapter} startIcon={<span>+</span>} size='small' sx={{ bgcolor: '#4285F4', color: 'white', '&:hover': { bgcolor: '#3367d6' } }}>
                  Add Chapter
                </Button>
              </Box>
              {chapters.map((chapter, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField fullWidth placeholder="Enter chapter name" value={chapter.chapterName} onChange={(e) => handleChapterChange(index, e.target.value)} required />
                  {chapters.length > 1 && (
                    <IconButton onClick={() => handleRemoveChapter(index)}>
                      <Close />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>

            {/* Subject Notes */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label">
                Notes
              </Typography>
              <TextField fullWidth multiline rows={4} placeholder="Enter notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Box>

            {/* Upload Test File */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label">
                Upload Test File
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<BsUpload />}
                sx={{ width: 'fit-content', borderColor: '#e0e0e0', color: '#333', textTransform: 'none', '&:hover': { borderColor: '#4285F4' } }}
              >
                Upload File
                <input type="file" hidden accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e.target.files[0])} />
              </Button>
              {uploadTestFileUrl && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  File uploaded: {uploadTestFileUrl.split('/').pop()}
                </Typography>
              )}
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#ffcc00', color: 'white', py: 1.5, fontWeight: 'bold', '&:hover': { bgcolor: '#e6b800' } }}>
                Submit Test
              </Button>
            </Box>
          </Box>
        </form>
      </Box>

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </MainFrame>
  );
};

export default TestSubmission;
