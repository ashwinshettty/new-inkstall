import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
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
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import MainFrame from './ui/MainFrame';
import { FiSave } from "react-icons/fi";

const allSubjectsList = [
  { name: 'Mathematics', fee: 3000, days: 2 },
  { name: 'Physics', fee: 2500, days: 2 },
  { name: 'Chemistry', fee: 2500, days: 2 },
  { name: 'Biology', fee: 2500, days: 2 },
  { name: 'English', fee: 2000, days: 1 },
  { name: 'Economics', fee: 2000, days: 1 }
];

const grades = ['Playschool', 'Nurserry', 'Jr. KG', 'Sr. KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
const branches = ['Goregoan West', 'Goregoan East', 'Online', 'Borivali', 'Kandivali', 'Others'];
const boards = ['IGCSE', 'CBSE', 'SSC', 'NIOS', 'IB', 'AS/A IBDP', 'Others'];
const admissionStatus = ['Admission Due', 'Active', 'Inactive', 'Completed'];

const Students = () => {
  // Student basic info states (now controlled)
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState(grades[0]);
  const [studentBranch, setStudentBranch] = useState(branches[0]);
  const [studentBoard, setStudentBoard] = useState(boards[0]);
  const [schoolName, setSchoolName] = useState('');
  const [status, setStatus] = useState(admissionStatus[0]);

  // Fee settings state
  const [gstEnabled, setGstEnabled] = useState(false);
  const [scholarshipEnabled, setScholarshipEnabled] = useState(false);
  const [scholarshipPercent, setScholarshipPercent] = useState(10);
  const [oneToOneEnabled, setOneToOneEnabled] = useState(false);
  const [oneToOnePercent, setOneToOnePercent] = useState(10);
  const [showUSD, setShowUSD] = useState(false);
  const [usdRate, setUsdRate] = useState(null);

  // Subjects state – each subject now has its own start and end dates
  const [selectedSubjects, setSelectedSubjects] = useState([
    { 
      subject: '',
      startDate: null,
      endDate: null
    }
  ]);

  // Phone numbers state
  const [phoneNumbers, setPhoneNumbers] = useState([
    { id: 1, number: '', relation: '', name: '' }
  ]);

  // Fee breakdown state (calculated using integrated logic)
  const [feeBreakdown, setFeeBreakdown] = useState(null);

  // Handle scholarship toggle
  const handleScholarshipToggle = (enabled) => {
    setScholarshipEnabled(enabled);
    if (enabled) {
      setScholarshipPercent(10); // default 10%
    }
  };

  // Handle one-to-one toggle
  const handleOneToOneToggle = (enabled) => {
    setOneToOneEnabled(enabled);
    if (enabled) {
      setOneToOnePercent(10); // default 10%
    }
  };

  // Phone number handlers
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

  // Subjects handlers
  const handleAddSubject = () => {
    setSelectedSubjects([
      ...selectedSubjects,
      { subject: '', startDate: null, endDate: null }
    ]);
  };

  const handleRemoveSubject = (index) => {
    const newSubjects = selectedSubjects.filter((_, i) => i !== index);
    if (newSubjects.length === 0) {
      newSubjects.push({ subject: '', startDate: null, endDate: null });
    }
    setSelectedSubjects(newSubjects);
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...selectedSubjects];
    if (field === 'subject') {
      newSubjects[index] = { ...newSubjects[index], subject: value };
    } else {
      // For startDate/endDate changes
      newSubjects[index] = { ...newSubjects[index], [field]: value };
    }
    setSelectedSubjects(newSubjects);
  };

  // Fetch USD rate if needed
  useEffect(() => {
    if (showUSD && !usdRate) {
      fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(response => response.json())
        .then(data => {
          const rate = data.rates.INR;
          setUsdRate(rate * 1.03); // 3% markup
        })
        .catch(error => {
          console.error('Error fetching USD rate:', error);
          setShowUSD(false);
        });
    }
  }, [showUSD, usdRate]);

  // Helper: Format amount according to currency
  const formatAmount = (amount) => {
    if (showUSD && usdRate) {
      const usdAmount = (amount / usdRate).toFixed(2);
      return `$${usdAmount}`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Fee Calculation Integration
  // Calculate installments (using 3 installments as in the second example)
  const calculateInstallments = (totalAmount, startDate) => {
    const installmentCount = 3;
    const installmentAmount = Math.round(totalAmount / installmentCount);
    const remainingAmount = totalAmount - installmentAmount * (installmentCount - 1);
    const startDateObj = new Date(startDate);
    const installments = [];
    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(startDateObj);
      dueDate.setMonth(startDateObj.getMonth() + i);
      installments.push({
        amount: i === installmentCount - 1 ? remainingAmount : installmentAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        paid: false
      });
    }
    return installments;
  };

  // Main fee calculation logic that integrates both subject-specific dates and overall student info
  const integratedCalculateFees = useCallback(() => {
    // Determine base rate based on branch and board
    let baseRate;
    if (studentBranch === 'Online') {
      baseRate = 1500;
    } else {
      switch (studentBoard) {
        case 'IGCSE': baseRate = 1200; break;
        case 'IB': baseRate = 2500; break;
        case 'NIOS': baseRate = 3000; break;
        case 'CBSE':
        case 'SSC': baseRate = 800; break;
        default: baseRate = 800;
      }
    }
    // Grade multiplier: early grades get no multiplier; numeric grades > 1 get a factor
    let gradeMultiplier = 1;
    const earlyGrades = ['Playschool', 'Nurserry', 'Jr. KG', 'Sr. KG', '1'];
    if (!earlyGrades.includes(studentGrade)) {
      const gradeNum = parseInt(studentGrade);
      if (!isNaN(gradeNum) && gradeNum > 1) {
        gradeMultiplier = Math.pow(1.1, gradeNum - 1);
      }
    }
    const baseMonthlyRate = baseRate * gradeMultiplier;

    let subtotal = 0;
    // Calculate fee for each selected subject (if valid dates & subject chosen)
    selectedSubjects.forEach(subject => {
      if (subject.startDate && subject.endDate && subject.subject) {
        const days = dayjs(subject.endDate).diff(dayjs(subject.startDate), 'days') + 1;
        let monthlyRate = baseMonthlyRate;
        if (oneToOneEnabled) {
          monthlyRate = baseMonthlyRate * (1 + oneToOnePercent / 100);
        }
        const dailyRate = monthlyRate / 30;
        const subjectFee = dailyRate * days;
        subtotal += subjectFee;
      }
    });

    // Apply a subject discount if 3 or more subjects are selected
    const subjectDiscountPercentage = selectedSubjects.length >= 3 ? 10 : 0;
    const subjectDiscountAmount = Math.round(subtotal * (subjectDiscountPercentage / 100));

    // Scholarship discount if enabled
    const scholarshipDiscountPercentage = scholarshipEnabled ? scholarshipPercent : 0;
    const scholarshipDiscountAmount = Math.round(subtotal * (scholarshipDiscountPercentage / 100));

    const baseAmount = subtotal - subjectDiscountAmount - scholarshipDiscountAmount;
    const gstAmount = gstEnabled ? Math.round(baseAmount * 0.18) : 0;
    const finalTotal = baseAmount + gstAmount;

    // Determine an installment start date (use the earliest subject startDate)
    let installmentStartDate = new Date();
    const validDates = selectedSubjects
      .filter(s => s.startDate)
      .map(s => new Date(s.startDate));
    if (validDates.length > 0) {
      installmentStartDate = new Date(Math.min(...validDates));
    }
    const installments = calculateInstallments(finalTotal, installmentStartDate);

    return {
      subtotal: Math.round(subtotal),
      subjectDiscount: { percentage: subjectDiscountPercentage, amount: subjectDiscountAmount },
      scholarshipDiscount: { percentage: scholarshipDiscountPercentage, amount: scholarshipDiscountAmount },
      baseAmount: Math.round(baseAmount),
      gstAmount,
      finalTotal,
      installments
    };
  }, [selectedSubjects, studentBoard, studentBranch, studentGrade, oneToOneEnabled, oneToOnePercent, gstEnabled, scholarshipEnabled, scholarshipPercent]);

  // Recalculate fees whenever relevant fields change
  useEffect(() => {
    const fees = integratedCalculateFees();
    setFeeBreakdown(fees);
  }, [integratedCalculateFees]);

  // Student photo state (currently not sent to backend)
  const [studentPhoto, setStudentPhoto] = useState(null);
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setStudentPhoto(file);
    }
  };

  // Helper function to compute fee for an individual subject
  const computeSubjectFee = (subjectItem) => {
    if (subjectItem.startDate && subjectItem.endDate && subjectItem.subject) {
      // Determine base rate based on branch and board
      let baseRate;
      if (studentBranch === 'Online') {
        baseRate = 1500;
      } else {
        switch (studentBoard) {
          case 'IGCSE': baseRate = 1200; break;
          case 'IB': baseRate = 2500; break;
          case 'NIOS': baseRate = 3000; break;
          case 'CBSE':
          case 'SSC': baseRate = 800; break;
          default: baseRate = 800;
        }
      }
      let gradeMultiplier = 1;
      const earlyGrades = ['Playschool', 'Nurserry', 'Jr. KG', 'Sr. KG', '1'];
      if (!earlyGrades.includes(studentGrade)) {
        const gradeNum = parseInt(studentGrade);
        if (!isNaN(gradeNum) && gradeNum > 1) {
          gradeMultiplier = Math.pow(1.1, gradeNum - 1);
        }
      }
      const baseMonthlyRate = baseRate * gradeMultiplier;
      let monthlyRate = baseMonthlyRate;
      if (oneToOneEnabled) {
        monthlyRate = baseMonthlyRate * (1 + oneToOnePercent / 100);
      }
      const dailyRate = monthlyRate / 30;
      const days = dayjs(subjectItem.endDate).diff(dayjs(subjectItem.startDate), 'days') + 1;
      const subjectFee = dailyRate * days;
      return Math.round(subjectFee);
    }
    return 0;
  };

  // Modified save handler to send data to the backend
  const handleSaveStudent = async () => {
    // Prepare subjects array with the required fields
    const preparedSubjects = selectedSubjects.map(s => ({
      name: s.subject,
      total: computeSubjectFee(s),
      startDate: s.startDate ? s.startDate.toISOString() : new Date().toISOString(),
      endDate: s.endDate ? s.endDate.toISOString() : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    }));

    // Map phone numbers to include relationName instead of name
    const preparedPhoneNumbers = phoneNumbers.map(p => ({
      number: p.number,
      relation: p.relation.toLowerCase(),
      relationName: p.name
    }));

    // Prepare fee configuration using feeBreakdown and fee settings
    const feeConfig = {
      basePrice: feeBreakdown?.subtotal || 0,
      gstApplied: gstEnabled,
      gstPercentage: gstEnabled ? 18 : 0,
      gstAmount: feeBreakdown?.gstAmount || 0,
      scholarshipApplied: scholarshipEnabled,
      scholarshipPercentage: scholarshipEnabled ? scholarshipPercent : 0,
      scholarshipAmount: feeBreakdown?.scholarshipDiscount.amount || 0,
      oneToOneApplied: oneToOneEnabled,
      oneToOnePercentage: oneToOneEnabled ? oneToOnePercent : 0,
      oneToOneAmount: oneToOneEnabled ? Math.round((feeBreakdown?.subtotal || 0) * (oneToOnePercent / 100)) : 0,
      baseAmount: feeBreakdown?.baseAmount || 0,
      totalAmount: feeBreakdown?.finalTotal || 0
    };

    const studentData = {
      studentName,
      grade: studentGrade,
      branch: studentBranch,
      board: studentBoard,
      school: schoolName,
      status,
      subjects: preparedSubjects,
      phoneNumbers: preparedPhoneNumbers,
      feeConfig
      // Note: The photo is not sent since the backend does not currently process file uploads.
    };

    console.log('Saving student data:', studentData);

    try {
      const response = await fetch('https://bc8b-2405-201-16-f22a-f470-6fb3-c5f0-b81a.ngrok-free.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Include any authorization headers if needed.
        },
        body: JSON.stringify(studentData)
      });
      const data = await response.json();
      if (response.ok) {
        alert('Student saved successfully!');
        // Optionally, clear the form or update UI state here.
      } else {
        alert('Error saving student: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student');
    }
  };

  return (
    <MainFrame sx={{ p: 3 }}>
      {/* Header with action buttons */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold', color: '#1a237e' }}>
          <AddIcon /> Add New Students
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<DownloadIcon />} sx={{ bgcolor: '#4a90e2', color: '#964b00', borderRadius: '8px' }}>
          Download Template
        </Button>
        <Button variant="contained" startIcon={<UploadIcon />} sx={{ bgcolor: '#fecc00', color: '#964b00', borderRadius: '8px' }}>
          Upload Excel
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#fecc00', color: '#964b00', borderRadius: '8px' }}>
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
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
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
            value={studentGrade}
            onChange={(e) => setStudentGrade(e.target.value)}
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
            value={studentBranch}
            onChange={(e) => setStudentBranch(e.target.value)}
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
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Board"
            size="small"
            required
            value={studentBoard}
            onChange={(e) => setStudentBoard(e.target.value)}
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {admissionStatus.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Fee Settings */}
        <Grid item xs={12}>
          <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 2, width: '100%' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Fee Settings</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {/* GST */}
              <FormControlLabel
                control={
                  <Switch 
                    size="medium" 
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">GST</Typography>}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
              {/* Scholarship */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="medium" 
                      checked={scholarshipEnabled}
                      onChange={(e) => handleScholarshipToggle(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">Scholarship</Typography>}
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
              {/* 1:1 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="medium" 
                      checked={oneToOneEnabled}
                      onChange={(e) => handleOneToOneToggle(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">1:1</Typography>}
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
              {/* USD */}
              <FormControlLabel
                control={
                  <Switch 
                    size="medium" 
                    checked={showUSD}
                    onChange={(e) => setShowUSD(e.target.checked)}
                  />
                }
                label={<Typography variant="body2">$</Typography>}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
            </Box>
          </Box>
        </Grid>

        {/* Subjects Selection with date pickers */}
        <Grid item xs={12} md={12} sx={{ mt: 1 }}>
          <Grid container justifyContent="space-between" alignItems="center">
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
            <Grid container spacing={2} key={index} sx={{ mt: 1, mb: 1, alignItems: 'center' }}>
              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', width: '40%' }}>
                <FormControl fullWidth size="medium" required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={subjectItem.subject}
                    label="Subject"
                    onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                  >
                    {allSubjectsList
                      .filter(s => 
                        !selectedSubjects.some((sel, i) => sel.subject === s.name && i !== index)
                      )
                      .map(s => (
                        <MenuItem key={s.name} value={s.name}>
                          {s.name}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '25%' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={subjectItem.startDate}
                    onChange={(value) => handleSubjectChange(index, 'startDate', value)}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth required />}
                  />
                </LocalizationProvider>
              </Box>
              <Box sx={{ display: 'flex', width: '25%' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={subjectItem.endDate}
                    onChange={(value) => handleSubjectChange(index, 'endDate', value)}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth required />}
                    minDate={subjectItem.startDate || dayjs()}
                    disabled={!subjectItem.startDate}
                  />
                </LocalizationProvider>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => handleRemoveSubject(index)} sx={{ color: 'error.main' }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
          
        {/* Fee Details (integrated fee breakdown) */}
        {feeBreakdown && (
          <Grid item xs={12}>
            <Box bgcolor="#f5f5f5" borderRadius={1} p={2}>
              <Typography variant="h6" gutterBottom>Fee Details</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">{formatAmount(feeBreakdown.subtotal)}</Typography>
              </Box>
              {feeBreakdown.subjectDiscount.amount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Multi-subject Discount ({feeBreakdown.subjectDiscount.percentage}%)
                  </Typography>
                  <Typography variant="body2" color="error">
                    -{formatAmount(feeBreakdown.subjectDiscount.amount)}
                  </Typography>
                </Box>
              )}
              {feeBreakdown.scholarshipDiscount.amount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Scholarship ({feeBreakdown.scholarshipDiscount.percentage}%)
                  </Typography>
                  <Typography variant="body2" color="error">
                    -{formatAmount(feeBreakdown.scholarshipDiscount.amount)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Base Amount</Typography>
                <Typography variant="body2">{formatAmount(feeBreakdown.baseAmount)}</Typography>
              </Box>
              {gstEnabled && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">GST (18%)</Typography>
                  <Typography variant="body2">{formatAmount(feeBreakdown.gstAmount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '2px solid #e0e0e0' }}>
                <Typography variant="subtitle2">Final Total</Typography>
                <Typography variant="subtitle2">{formatAmount(feeBreakdown.finalTotal)}</Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Phone Numbers */}
        <Grid item xs={12} container justifyContent="space-between" alignItems="center">
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
          <Grid container spacing={2} key={phone.id} sx={{ mb: 2, ml: 1 }}>
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
                  {['Father', 'Mother', 'Guardian', 'Self', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Grandfather', 'Grandmother', 'Other']
                    .map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Contact Person's Name"
                required
                value={phone.name}
                onChange={(e) => handlePhoneNumberChange(phone.id, 'name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={1} container alignItems="center">
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
        <Grid item xs={12}>
          <Button
            variant="contained"
            size="medium"
            fullWidth
            onClick={handleSaveStudent}
            sx={{ mt: 2, backgroundColor: '#fecc00', color: '#964b00', gap: 1 }}
          >
            <FiSave /> Save Student
          </Button>
        </Grid>
      </Grid>
    </MainFrame>
  );
};

export default Students;