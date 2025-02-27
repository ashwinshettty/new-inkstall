import React, { useState, useContext } from 'react';
import MainFrame from './ui/MainFrame';
import { 
  Box, 
  Typography, 
  Autocomplete, 
  TextField, 
  IconButton, 
  Paper, 
  Button, 
  Select, 
  MenuItem 
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { StudentsContext } from '../context/StudentContext';
import { SubjectsContext } from '../context/SubjectsContext';

const StudentPerformance = () => {
  // State for selected student
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // States for new performance entry
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [testType, setTestType] = useState('Inkstall Test');
  const [marks, setMarks] = useState('0');
  const [totalMarks, setTotalMarks] = useState('100');

  // Sample test types (could be fetched as well)
  const testTypes = [
    'Inkstall Test',
    'School Test'
  ];

  // Sample performance history
  const performanceHistory = [
    {
      id: 1,
      subject: 'German',
      date: 'Feb 27, 2025',
      time: '12:34:22:34Z',
      testType: 'inkstall test',
      marks: 12,
      totalMarks: 122,
      percentage: 9.8
    }
  ];

  // Use contexts for students and subjects
  const { students, loading: studentsLoading } = useContext(StudentsContext);
  const { subjects, loading: subjectsLoading } = useContext(SubjectsContext);

  // Handle student selection
  const handleStudentChange = (event, newValue) => {
    setSelectedStudent(newValue);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      student: selectedStudent,
      subject,
      description,
      testType,
      marks,
      totalMarks
    });
    // Reset form fields after submission
    setSubject('');
    setDescription('');
    setTestType('Inkstall Test');
    setMarks('0');
    setTotalMarks('100');
  };

  if (studentsLoading || subjectsLoading) return <div>Loading students...</div>;

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
                getOptionLabel={(option) => option.name || ''}
                value={selectedStudent}
                onChange={handleStudentChange}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select a student" />
                )}
                fullWidth
                clearOnBlur={false}
                clearOnEscape
                openOnFocus
                blurOnSelect
              />
            </Box>
          </Box>
        </Paper>

        {/* Performance Entry and History sections only show when a student is selected */}
        {selectedStudent && (
          <>
            {/* Add Performance Entry Section */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                Add Performance Entry
              </Typography>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Subject Field using SubjectsContext */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" component="label">
                      Subject
                    </Typography>
                    <Autocomplete
                      options={subjects}
                      getOptionLabel={(option) => option.name || ''}
                      value={subject ? subjects.find(s => s.name === subject) || null : null}
                      onChange={(event, newValue) => setSubject(newValue ? newValue.name : '')}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Select a subject..." fullWidth size="small" />
                      )}
                      fullWidth
                    />
                  </Box>
                  
                  {/* Description and Test Type Row */}
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
                  
                  {/* Marks and Total Marks Row */}
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
                  
                  {/* Submit Button */}
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
                      key={entry.id} 
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
                          {entry.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.time} · {entry.testType}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1" sx={{ color: '#1976D2', fontWeight: 'bold' }}>
                          {entry.percentage.toFixed(1)}%
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
            
            {/* Attendance History Section */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Attendance History
              </Typography>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No attendance data available
                </Typography>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </MainFrame>
  );
};

export default StudentPerformance;
