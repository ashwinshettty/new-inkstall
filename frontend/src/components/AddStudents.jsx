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
    FormControl
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
  
  const AddStudents = () => {
    // Basic student info state
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [selectedSubjects, setSelectedSubjects] = useState([])
  
    // Fee settings state
    const [gstEnabled, setGstEnabled] = useState(false)
    const [scholarshipEnabled, setScholarshipEnabled] = useState(false)
    const [oneToOneEnabled, setOneToOneEnabled] = useState(false)
    const [scholarshipPercent, setScholarshipPercent] = useState(30)
    const [oneToOnePercent, setOneToOnePercent] = useState(90)
    const [showUSD, setShowUSD] = useState(false)
    const [usdRate, setUsdRate] = useState(null)
  
    // Subject data
    const subjects = [
      { name: 'Mathematics', fee: 2000, days: 1 },
      { name: 'Physics', fee: 2000, days: 1 },
      { name: 'Chemistry', fee: 2000, days: 1 },
      { name: 'Biology', fee: 2000, days: 1 },
      { name: 'English', fee: 1500, days: 1 },
      { name: 'German', fee: 1500, days: 1 },
      { name: 'French', fee: 1500, days: 1 },
      { name: 'History', fee: 1500, days: 1 },
      { name: 'Geography', fee: 1500, days: 1 },
      { name: 'Computer Science', fee: 2500, days: 1 },
      { name: 'Economics', fee: 2000, days: 1 }
    ]
  
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
  
    // Fee calculation logic
    const calculateFees = () => {
      // Calculate subtotal from selected subjects
      const subtotal = selectedSubjects.reduce((total, subject) => {
        const subjectData = subjects.find(s => s.name === subject)
        let fee = subjectData?.fee || 0
  
        // Apply 1:1 increase if enabled
        if (oneToOneEnabled) {
          fee += (fee * oneToOnePercent) / 100
        }
  
        return total + fee
      }, 0)
  
      // Calculate scholarship discount
      const scholarshipAmount = scholarshipEnabled ? (subtotal * scholarshipPercent) / 100 : 0
  
      // Calculate base amount after scholarship
      const baseAmount = subtotal - scholarshipAmount
  
      // Calculate GST
      const gstAmount = gstEnabled ? (baseAmount * 18) / 100 : 0
  
      // Calculate total
      const totalAmount = baseAmount + gstAmount
  
      return {
        subtotal,
        scholarshipAmount,
        baseAmount,
        gstAmount,
        totalAmount
      }
    }
  
    // Date field renderer
    const renderDateField = (label, value, onChange) => (
      <Grid item xs={12} md={6} display="flex" alignItems="center" gap={2}>
        <Typography variant="subtitle2">{label}</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={value}
            onChange={onChange}
            inputFormat="DD/MM/YYYY"
            renderInput={(params) => (
              <TextField {...params} size="small" fullWidth />
            )}
          />
        </LocalizationProvider>
      </Grid>
    )
  
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
      <>
        <Box sx={{ mt: 4, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
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
  
          {/* Dates */}
          <Grid item xs={12} md={9} display="flex" alignItems="center" gap={2}>
              {renderDateField('Start Date', startDate, setStartDate)}
              {renderDateField('End Date', endDate, setEndDate)}
          </Grid>
  
          {/* Fee Settings and Subjects Row */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {/* Fee Settings */}
              <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 2, width: '400px' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Fee Settings</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* GST Switch */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch 
                          size="small" 
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
                          size="small" 
                          checked={scholarshipEnabled}
                          onChange={(e) => setScholarshipEnabled(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="body2">Scholarship</Typography>
                      }
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                    />
                    {scholarshipEnabled && (
                      <Select
                        size="small"
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
                          size="small" 
                          checked={oneToOneEnabled}
                          onChange={(e) => setOneToOneEnabled(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="body2">1:1</Typography>
                      }
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                    />
                    {oneToOneEnabled && (
                      <Select
                        size="small"
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
                          size="small" 
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
  
              {/* Subjects Selection */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Selected Subjects</Typography>
                <Autocomplete
                  multiple
                  size="small"
                  options={subjects.map(subject => subject.name)}
                  value={selectedSubjects}
                  onChange={(event, newValue) => setSelectedSubjects(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select subjects"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Box>
            </Box>
          </Grid>
  
          {/* Fee Details */}
          {selectedSubjects.length > 0 && (
            <Grid item xs={12}>
              <Box bgcolor="#f5f5f5" borderRadius={1} p={2}>
                <Typography variant="h6" gutterBottom>Fee Details</Typography>
                
                {/* Subject-wise breakdown */}
                {selectedSubjects.map(subject => {
                  const subjectData = subjects.find(s => s.name === subject)
                  let fee = subjectData?.fee || 0
                  if (oneToOneEnabled) {
                    fee += (fee * oneToOnePercent) / 100
                  }
                  
                  return (
                    <Box 
                      key={subject}
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: '1px solid #e0e0e0'
                      }}
                    >
                      <Typography variant="body2">{subject}</Typography>
                      <Typography variant="body2">{formatAmount(fee)}</Typography>
                    </Box>
                  )
                })}
  
                {/* Fee calculations */}
                <Box sx={{ mt: 3 }}>
                  {(() => {
                    const fees = calculateFees()
                    return (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">Subtotal:</Typography>
                          <Typography variant="subtitle2">{formatAmount(fees.subtotal)}</Typography>
                        </Box>
  
                        {scholarshipEnabled && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="error">
                              Scholarship ({scholarshipPercent}%):
                            </Typography>
                            <Typography variant="subtitle2" color="error">
                              -{formatAmount(fees.scholarshipAmount)}
                            </Typography>
                          </Box>
                        )}
  
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2">Base Amount:</Typography>
                          <Typography variant="subtitle2">{formatAmount(fees.baseAmount)}</Typography>
                        </Box>
  
                        {gstEnabled && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2">GST (18%):</Typography>
                            <Typography variant="subtitle2">{formatAmount(fees.gstAmount)}</Typography>
                          </Box>
                        )}
  
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          mt: 2,
                          pt: 2,
                          borderTop: '2px solid #e0e0e0'
                        }}>
                          <Typography variant="h6">Total Amount:</Typography>
                          <Typography variant="h6">{formatAmount(fees.totalAmount)}</Typography>
                        </Box>
                      </>
                    )
                  })()}
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
      </>
    )
  }
  
  export default AddStudents