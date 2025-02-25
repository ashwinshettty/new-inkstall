import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  InputAdornment
} from '@mui/material'
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers'
import {
  AdapterDayjs
} from '@mui/x-date-pickers/AdapterDayjs'
import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import MainFrame from './ui/MainFrame';
import { FiSave } from "react-icons/fi";
import dayjs from 'dayjs';

const Students = () => {
  // Basic student info state
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  // Fee settings state
  const [gstEnabled, setGstEnabled] = useState(false)
  const [scholarshipEnabled, setScholarshipEnabled] = useState(false)
  const [scholarshipPercent, setScholarshipPercent] = useState(10)
  const [oneToOneEnabled, setOneToOneEnabled] = useState(false)
  const [oneToOnePercent, setOneToOnePercent] = useState(10)
  const [showUSD, setShowUSD] = useState(false)
  const [usdRate, setUsdRate] = useState(null)

  // Handle scholarship toggle
  const handleScholarshipToggle = (enabled) => {
    setScholarshipEnabled(enabled);
    if (enabled) {
      setScholarshipPercent(10); // Set default to 10% when enabled
    }
  };

  // Handle one-to-one toggle
  const handleOneToOneToggle = (enabled) => {
    setOneToOneEnabled(enabled);
    if (enabled) {
      setOneToOnePercent(10); // Set default to 10% when enabled
    }
  };

  // Subject data
  const allSubjects = [
    { name: 'Mathematics', fee: 3000, days: 2 },
    { name: 'Physics', fee: 2500, days: 2 },
    { name: 'Chemistry', fee: 2500, days: 2 },
    { name: 'Biology', fee: 2500, days: 2 },
    { name: 'English', fee: 2000, days: 1 },
    { name: 'Economics', fee: 2000, days: 1 }
  ]

  const [selectedSubjects, setSelectedSubjects] = useState([
    { 
      subject: '',
      startDate: null,
      endDate: null,
      fee: 0,
      days: 0
    }
  ]);

  // Phone numbers state
  const [phoneNumbers, setPhoneNumbers] = useState([
    { id: 1, number: '', relation: '', name: '' }
  ]);

  const grades = ['Playschool', 'Nurserry', 'Jr. KG', 'Sr. KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']

  const branches = ['Goregoan West', 'Goregoan East', 'Online', 'Borivali', 'Kandivali', 'Others']

  const boards = ['IGCSE', 'CBSE', 'SSC', 'NIOS', 'IB', 'AS/A IBDP', 'Others']

  const admissionStatus = ['Admission Due', 'Active', 'Inactive', 'Completed']

  const relationOptions = [
    'Father',
    'Mother',
    'Guardian',
    'Self',
    'Brother',
    'Sister',
    'Uncle',
    'Aunt',
    'Grandfather',
    'Grandmother',
    'Other'
  ];

  const handleAddPhoneNumber = () => {
    setPhoneNumbers([
      ...phoneNumbers,
      { 
        id: phoneNumbers.length + 1,
        number: '',
        relation: '',
        name: ''
      }
    ]);
  };

  const handleRemovePhoneNumber = (id) => {
    setPhoneNumbers(phoneNumbers.filter(phone => phone.id !== id));
  };

  const handlePhoneNumberChange = (id, field, value) => {
    setPhoneNumbers(phoneNumbers.map(phone => 
      phone.id === id ? { ...phone, [field]: value } : phone
    ));
  };

  const handleAddSubject = () => {
    setSelectedSubjects([
      ...selectedSubjects,
      { 
        subject: '',
        startDate: null,
        endDate: null,
        fee: 0,
        days: 0
      }
    ]);
  };

  const handleRemoveSubject = (index) => {
    const newSubjects = selectedSubjects.filter((_, i) => i !== index);
    // If removing the last subject, add an empty one
    if (newSubjects.length === 0) {
      newSubjects.push({ 
        subject: '',
        startDate: null,
        endDate: null,
        fee: 0,
        days: 0
      });
    }
    setSelectedSubjects(newSubjects);
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...selectedSubjects];
    if (field === 'subject') {
      const selectedSubject = allSubjects.find(s => s.name === value);
      newSubjects[index] = {
        ...newSubjects[index],
        subject: value,
        fee: selectedSubject.fee,
        days: selectedSubject.days
      };
    } else if (field === 'startDate') {
      if (newSubjects[index].endDate && dayjs(value).isAfter(newSubjects[index].endDate)) {
        newSubjects[index] = {
          ...newSubjects[index],
          startDate: value,
          endDate: null
        };
      } else {
        newSubjects[index] = {
          ...newSubjects[index],
          startDate: value
        };
      }
    } else {
      newSubjects[index] = {
        ...newSubjects[index],
        [field]: value
      };
    }
    setSelectedSubjects(newSubjects);
  };

  // Helper function to calculate days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'days') + 1; // +1 to include both start and end dates
  };

  // Helper function to get subject fee with days calculation and 1:1 pricing if enabled
  const getSubjectFee = (subject) => {
    if (!subject.startDate || !subject.endDate) return 0;
    
    const numberOfDays = calculateDays(subject.startDate, subject.endDate);
    let feePerDay = subject.fee;
    
    // Apply 1:1 increase if enabled
    if (oneToOneEnabled) {
      feePerDay += (feePerDay * oneToOnePercent) / 100;
    }
    
    return feePerDay * numberOfDays * subject.days; // multiply by days per week
  };

  // Fee calculation logic
  const calculateFees = () => {
    // Calculate subtotal from selected subjects with days and 1:1 pricing if enabled
    const subtotal = selectedSubjects.reduce((total, subject) => {
      return total + getSubjectFee(subject);
    }, 0);

    // Calculate GST if enabled
    const gstAmount = gstEnabled ? (subtotal * 18) / 100 : 0;

    // Calculate total after GST
    const totalAfterGst = subtotal + gstAmount;

    // Apply scholarship if enabled
    const scholarshipAmount = scholarshipEnabled ? (totalAfterGst * scholarshipPercent) / 100 : 0;

    // Final total after all calculations
    const finalTotal = totalAfterGst - scholarshipAmount;

    return {
      subtotal,
      gstAmount,
      totalAfterGst,
      scholarshipAmount,
      finalTotal
    };
  };

  // Amount formatter
  const formatAmount = (amount) => {
    if (showUSD && usdRate) {
      const usdAmount = (amount / usdRate).toFixed(2)
      return `$${usdAmount}`
    }
    return `₹${amount.toLocaleString()}`
  }

  // Fetch USD rate
  useEffect(() => {
    if (showUSD && !usdRate) {
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(response => response.json())
        .then(data => {
          const rate = data.rates.INR
          setUsdRate(rate * 1.03) // Add 3% markup
        })
        .catch(error => {
          console.error('Error fetching USD rate:', error)
          setShowUSD(false)
        })
    }
  }, [showUSD, usdRate])

  // Student photo state
  const [studentPhoto, setStudentPhoto] = useState(null);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setStudentPhoto(file);
    }
  };

  const handleSaveStudent = () => {
    // Collect all form data
    const studentData = {
      phoneNumbers,
      photo: studentPhoto,
      // Add other form fields here
    };
    
    console.log('Saving student data:', studentData);
    // TODO: Add your API call here to save the data
  };

  return (
    <MainFrame sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: '#1a237e' }}>
          <AddIcon /> Add New Students
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ bgcolor: '#4a90e2', color: '#964b00', borderRadius: '8px' }}
        >
          Download Template
        </Button>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          sx={{ bgcolor: '#fecc00', color: '#964b00', borderRadius: '8px' }}
        >
          Upload Excel
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ bgcolor: '#fecc00', color: '#964b00', borderRadius: '8px' }}
        >
          Add Manually
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Student Basic Info */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Student Name"
            size="small"
            required
            placeholder="Enter student name"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Grade"
            size="small"
            required
            defaultValue={grades[0]}
          >
            {grades.map((grade) => (
              <MenuItem key={grade} value={grade}>
                {grade}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Branch"
            size="small"
            required
            defaultValue={branches[0]}
          >
            {branches.map((branch) => (
              <MenuItem key={branch} value={branch}>
                {branch}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="School"
            size="small"
            placeholder="Enter school name"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Board"
            size="small"
            required
            defaultValue={boards[0]}
          >
            {boards.map((board) => (
              <MenuItem key={board} value={board}>
                {board}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Status"
            size="small"
            defaultValue={admissionStatus[0]}
          >
            {admissionStatus.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Fee Settings*/}
        <Grid item xs={12}>
          <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 2, width: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Fee Settings</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {/* GST Switch */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="medium" 
                      checked={gstEnabled}
                      onChange={(e) => setGstEnabled(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">GST</Typography>
                  }
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
              </Box>

              {/* Scholarship Switch and Select */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="medium" 
                      checked={scholarshipEnabled}
                      onChange={(e) => handleScholarshipToggle(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">Scholarship</Typography>
                  }
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
                {scholarshipEnabled && (
                  <Select
                    size="medium"
                    value={scholarshipPercent}
                    onChange={(e) => setScholarshipPercent(e.target.value)}
                    sx={{ minWidth: 80, height: 32 }}
                  >
                    {[10, 20, 30, 40, 50].map(percent => (
                      <MenuItem key={percent} value={percent}>{percent}%</MenuItem>
                    ))}
                  </Select>
                )}
              </Box>

              {/* 1:1 Switch and Select */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="medium" 
                      checked={oneToOneEnabled}
                      onChange={(e) => handleOneToOneToggle(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">1:1</Typography>
                  }
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
                {oneToOneEnabled && (
                  <Select
                    size="medium"
                    value={oneToOnePercent}
                    onChange={(e) => setOneToOnePercent(e.target.value)}
                    sx={{ minWidth: 80, height: 32 }}
                  >
                    {Array.from({ length: 20 }, (_, i) => (i + 1) * 10).map(percent => (
                      <MenuItem key={percent} value={percent}>{percent}%</MenuItem>
                    ))}
                  </Select>
                )}
              </Box>

              {/* USD Switch */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="medium" 
                      checked={showUSD}
                      onChange={(e) => setShowUSD(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">$</Typography>
                  }
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Subjects Selection */}
        <Grid item xs={12} md={12} sx={{ flex: 1, mt: 1 }}>
          {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Subjects</Typography> */}
          <Grid item xs={12} display="flex" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Subjects <Typography component="span" color="error">*</Typography>
            </Typography>
            <Button
              variant="text"
              startIcon={<AddIcon />}
              size="small"
              sx={{ color: 'primary.main' }}
              onClick={handleAddSubject}
            >
              Add Subject
            </Button>
          </Grid>

          {selectedSubjects.map((subjectItem, index) => (
            <Grid item container spacing={2} key={index} sx={{ mt: 2,mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: '40%', ml: 2}}>
                <FormControl fullWidth size="medium" required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={subjectItem.subject}
                    label="Subject"
                    onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                  >
                    {allSubjects
                      .filter(subject => 
                        !selectedSubjects.some(selected => 
                          selected.subject === subject.name && selected !== subjectItem
                        )
                      )
                      .map(subject => (
                        <MenuItem key={subject.name} value={subject.name}>
                          {subject.name}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ width: '25%', display: 'flex', justifyContent: 'center'}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={subjectItem.startDate}
                    onChange={(value) => handleSubjectChange(index, 'startDate', value)}
                    renderInput={(params) => (
                      <TextField {...params} size="small" fullWidth required />
                    )}
                  />
                </LocalizationProvider>
              </Box>
              <Box sx={{ width: '25%'}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={subjectItem.endDate}
                    onChange={(value) => handleSubjectChange(index, 'endDate', value)}
                    renderInput={(params) => (
                      <TextField {...params} size="small" fullWidth required />
                    )}
                    minDate={subjectItem.startDate || dayjs()} // Cannot select dates before start date or today
                    disabled={!subjectItem.startDate} // Disable if no start date is selected
                  />
                </LocalizationProvider>
              </Box>
              <Box>
                <IconButton 
                  size="small" 
                  onClick={() => handleRemoveSubject(index)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
          
        {/* Fee Details */}
        {selectedSubjects.length > 0 && (
          <Grid item xs={12}>
            <Box bgcolor="#f5f5f5" borderRadius={1} p={2}>
              <Typography variant="h6" gutterBottom>Fee Details</Typography>
              
              {/* Subject-wise breakdown */}
              {selectedSubjects
                .filter(subject => subject.startDate && subject.endDate && subject.subject) // Only show subjects with valid dates and name
                .map(subject => {
                  const fee = getSubjectFee(subject);
                  if (fee === 0) return null; // Skip if fee is 0
                  
                  return (
                    <Box 
                      key={subject.subject}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: '1px solid #e0e0e0'
                      }}
                    >
                      <Box>
                        <Typography variant="body2">
                          {subject.subject}
                        </Typography>
                        {/* <Typography variant="caption" color="text.secondary">
                          ₹{subject.fee}/day × {subject.days} days/week × {calculateDays(subject.startDate, subject.endDate)} days
                        </Typography> */}
                      </Box>
                      <Typography variant="body2">{formatAmount(fee)}</Typography>
                    </Box>
                  );
                })
                .filter(Boolean) // Remove null entries
              }

              {/* Fee calculations */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{formatAmount(calculateFees().subtotal)}</Typography>
                </Box>

                {gstEnabled && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">GST (18%)</Typography>
                    <Typography variant="body2">{formatAmount(calculateFees().gstAmount)}</Typography>
                  </Box>
                )}

                {gstEnabled && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total after GST</Typography>
                    <Typography variant="body2">{formatAmount(calculateFees().totalAfterGst)}</Typography>
                  </Box>
                )}

                {scholarshipEnabled && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Scholarship ({scholarshipPercent}%)</Typography>
                    <Typography variant="body2" color="error.main">
                      -{formatAmount(calculateFees().scholarshipAmount)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mt: 2,
                  pt: 1,
                  borderTop: '2px solid #e0e0e0'
                }}>
                  <Typography variant="subtitle2">Final Total</Typography>
                  <Typography variant="subtitle2">{formatAmount(calculateFees().finalTotal)}</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Phone Numbers */}
        <Grid item xs={12} display="flex" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Phone Numbers <Typography component="span" color="error">*</Typography>
          </Typography>
          <Button
            variant="text"
            startIcon={<AddIcon />}
            size="small"
            sx={{ color: 'primary.main' }}
            onClick={handleAddPhoneNumber}
          >
            Add Phone Number
          </Button>
        </Grid>

        {phoneNumbers.map((phone) => (
          <Grid container spacing={2} key={phone.id} sx={{ ml: 1, mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Number (with country code)"
                required
                value={phone.number}
                onChange={(e) => handlePhoneNumberChange(phone.id, 'number', e.target.value)}
                placeholder="+91XXXXXXXXXX"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Relation</InputLabel>
                <Select
                  value={phone.relation}
                  label="Relation"
                  onChange={(e) => handlePhoneNumberChange(phone.id, 'relation', e.target.value)}
                >
                  {relationOptions.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Contact person's name"
                required
                value={phone.name}
                onChange={(e) => handlePhoneNumberChange(phone.id, 'name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={1} display="flex" alignItems="center">
              {phoneNumbers.length > 1 && (
                <IconButton 
                  size="small" 
                  onClick={() => handleRemovePhoneNumber(phone.id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}

        {/* Student Photo */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Student Photo
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '5px',
              width: '100%',
              backgroundColor: '#fff'
            }}
          />
        </Grid>

        {/* Save Button */}
        <Grid item xs={12} sx={{ padding: 0 }}>
          <Button
            variant="contained"
            size="medium"
            fullWidth
            onClick={handleSaveStudent}
            sx={{ mt: 2, backgroundColor: '#fecc00', color: '#964b00', gap: 1, margin: 0}}
          >< FiSave />
            Save Student
          </Button>
        </Grid>
      </Grid>
    </MainFrame>
  )
}

export default Students