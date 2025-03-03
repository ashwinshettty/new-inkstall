import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import MainFrame from './ui/MainFrame';
import { Box, Typography, Autocomplete, TextField, Paper, Button, Select, MenuItem } from '@mui/material';
import api from '../api';
import { StudentsContext } from '../context/StudentContext';

const StudentPerformance = () => {
  // State for selected student
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // States for new performance entry
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [testType, setTestType] = useState('Inkstall Test');
  const [marks, setMarks] = useState('0');
  const [totalMarks, setTotalMarks] = useState('100');

  // State to hold fetched performance history
  const [performanceHistory, setPerformanceHistory] = useState([]);

  // Sample test types
  const testTypes = [
    'Inkstall Test',
    'School Test'
  ];

  // Use context for students
  const { students, loading: studentsLoading } = useContext(StudentsContext);

  // Handle student selection and fetch performance history
  const handleStudentChange = (event, newValue) => {
    setSelectedStudent(newValue);
    setSubject('');
  };

  // Fetch performance history when selectedStudent changes
  useEffect(() => {
    if (selectedStudent) {
      fetchPerformanceHistory(selectedStudent.studentId);
    } else {
      setPerformanceHistory([]);
    }
  }, [selectedStudent]);

  const fetchPerformanceHistory = async (studentId) => {
    try {
      const res = await api.get(`/student-performance/${studentId}`);
      if (res.data.success) {
        setPerformanceHistory(res.data.data);
      } else {
        setPerformanceHistory([]);
      }
    } catch (error) {
      console.error("Error fetching performance history", error);
      setPerformanceHistory([]);
    }
  };

  // Handle form submission to create a new performance record
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      studentId: selectedStudent.studentId,
      subject,
      description,
      testType,
      marks,
      totalMarks,
      submitDateTime: new Date().toISOString()
    };
    try {
      const res = await api.post('/student-performance', payload);
      if (res.data.success) {
        // Optionally display a success notification here
        // Refresh performance history after submission
        fetchPerformanceHistory(selectedStudent.studentId);
      }
    } catch (error) {
      console.error("Error saving performance", error);
    }
    // Reset form fields after submission
    setSubject('');
    setDescription('');
    setTestType('Inkstall Test');
    setMarks('0');
    setTotalMarks('100');
  };

  if (studentsLoading) return <div>Loading students...</div>;

  return (
    <MainFrame>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Student Performance
        </Typography>
        
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Student Selection */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1" component="label">
                Select Student
              </Typography>
              <Autocomplete
                options={students}
                // Use studentName if available; fallback to name
                getOptionLabel={(option) => option.studentName || option.name || ''}
                value={selectedStudent}
                onChange={handleStudentChange}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select a student" />
                )}
              />
            </Box>

            {selectedStudent && (
              <>
                {/* Add Performance Entry Section */}
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                    Add Performance Entry
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" component="label">
                          Subject
                        </Typography>
                        <Select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          displayEmpty
                          disabled={!selectedStudent}
                        >
                          <MenuItem value="" disabled>
                            Select a subject
                          </MenuItem>
                          {selectedStudent?.subjects?.map((subj) => (
                            <MenuItem key={subj.name} value={subj.name}>
                              {subj.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" component="label">
                            Description
                          </Typography>
                          <TextField
                            placeholder="e.g., Quiz 1"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" component="label">
                            Test Type
                          </Typography>
                          <Select
                            value={testType}
                            onChange={(e) => setTestType(e.target.value)}
                            fullWidth
                            size="small"
                          >
                            {testTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" component="label">
                            Marks
                          </Typography>
                          <TextField
                            type="number"
                            value={marks}
                            onChange={(e) => setMarks(e.target.value)}
                            fullWidth
                            size="small"
                            inputProps={{ min: 0 }}
                          />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" component="label">
                            Total Marks
                          </Typography>
                          <TextField
                            type="number"
                            value={totalMarks}
                            onChange={(e) => setTotalMarks(e.target.value)}
                            fullWidth
                            size="small"
                            inputProps={{ min: 1 }}
                          />
                        </Box>
                      </Box>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{
                          bgcolor: '#1976D2',
                          color: 'white',
                          py: 1.5,
                          '&:hover': { bgcolor: '#115293' }
                        }}
                      >
                        Submit Performance
                      </Button>
                    </Box>
                  </form>
                </Paper>
                
                {/* Performance History Section */}
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                    Performance History
                  </Typography>
                  {performanceHistory.length > 0 ? (
                    <Box>
                      {performanceHistory.map((entry) => (
                        <Box 
                          key={entry._id} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 2,
                            borderBottom: '1px solid #e0e0e0'
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {entry.subject}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(entry.submitDateTime).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(entry.submitDateTime).toLocaleTimeString()} · {entry.testType}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            {/* Calculate percentage if needed */}
                            <Typography variant="subtitle1" sx={{ color: '#1976D2', fontWeight: 'bold' }}>
                              {((entry.marks / entry.totalMarks) * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {entry.marks}/{entry.totalMarks}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No performance data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </MainFrame>
  );
};

export default StudentPerformance;
