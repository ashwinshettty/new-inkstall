import { LuClipboard } from "react-icons/lu";
import React, { useEffect, useState, useCallback, useContext } from "react";
import dayjs from "dayjs";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import MainFrame from "./ui/MainFrame";
import { FiSave } from "react-icons/fi";
import { BsUpload } from "react-icons/bs";

import api from "../api";
import { SubjectsContext } from "../context/SubjectsContext";
import { InfoContext } from "../context/InfoContext";

const Students = () => {
  const { subjects } = useContext(SubjectsContext);
  const { grades } = useContext(InfoContext);

  // Student basic info states
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("Playschool");
  const [studentBranch, setStudentBranch] = useState("Goregoan West");
  const [studentBoard, setStudentBoard] = useState("IGCSE");
  const [schoolName, setSchoolName] = useState("");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [state, setState] = useState("");
  const [status, setStatus] = useState("Admission Due");
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fee settings state
  const [gstEnabled, setGstEnabled] = useState(false);
  const [scholarshipEnabled, setScholarshipEnabled] = useState(false);
  const [scholarshipPercent, setScholarshipPercent] = useState(10);
  const [oneToOneEnabled, setOneToOneEnabled] = useState(false);
  const [oneToOnePercent, setOneToOnePercent] = useState(10);
  const [showUSD, setShowUSD] = useState(false);
  const [usdRate, setUsdRate] = useState(null);

  // New state for custom total amount (if provided, the fee breakdown gets scaled)
  const [customTotalAmount, setCustomTotalAmount] = useState("");

  // Subjects state – each subject now has its own start and end dates
  const [selectedSubjects, setSelectedSubjects] = useState([
    {
      subject: "",
      startDate: null,
      endDate: null,
    },
  ]);

  // Phone numbers state
  const [phoneNumbers, setPhoneNumbers] = useState([
    { 
      id: 1, 
      number: "", 
      relation: "", 
      name: "", 
      educationQualification: "", 
      organization: "", 
      designation: "", 
      department: "", 
      photo: null, 
      photoPreview: null 
    },
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
        number: "", 
        relation: "", 
        name: "", 
        educationQualification: "", 
        organization: "", 
        designation: "", 
        department: "", 
        photo: null, 
        photoPreview: null 
      },
    ]);
  };

  const handleRemovePhoneNumber = (id) => {
    setPhoneNumbers(phoneNumbers.filter((phone) => phone.id !== id));
  };

  const handlePhoneNumberChange = (id, field, value) => {
    setPhoneNumbers(
      phoneNumbers.map((phone) =>
        phone.id === id ? { ...phone, [field]: value } : phone
      )
    );
  };

  const handleContactPhotoChange = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoneNumbers(
        phoneNumbers.map((phone) =>
          phone.id === id
            ? { ...phone, photo: file, photoPreview: URL.createObjectURL(file) }
            : phone
        )
      );
    }
  };

  // Subjects handlers
  const handleAddSubject = () => {
    setSelectedSubjects([
      ...selectedSubjects,
      { subject: "", startDate: null, endDate: null },
    ]);
  };

  const handleRemoveSubject = (index) => {
    const newSubjects = selectedSubjects.filter((_, i) => i !== index);
    if (newSubjects.length === 0) {
      newSubjects.push({ subject: "", startDate: null, endDate: null });
    }
    setSelectedSubjects(newSubjects);
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...selectedSubjects];
    if (field === "subject") {
      newSubjects[index] = { ...newSubjects[index], subject: value };
    } else {
      newSubjects[index] = { ...newSubjects[index], [field]: value };
    }
    setSelectedSubjects(newSubjects);
  };

  // Fetch USD rate if needed
  useEffect(() => {
    if (showUSD && !usdRate) {
      fetch("https://api.exchangerate-api.com/v4/latest/USD")
        .then((response) => response.json())
        .then((data) => {
          const rate = data.rates.INR;
          setUsdRate(rate * 1.03); // 3% markup
        })
        .catch((error) => {
          console.error("Error fetching USD rate:", error);
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
    const remainingAmount =
      totalAmount - installmentAmount * (installmentCount - 1);
    const startDateObj = new Date(startDate);
    const installments = [];
    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(startDateObj);
      dueDate.setMonth(startDateObj.getMonth() + i);
      installments.push({
        amount:
          i === installmentCount - 1 ? remainingAmount : installmentAmount,
        dueDate: dueDate.toISOString().split("T")[0],
        paid: false,
      });
    }
    return installments;
  };

  // Main fee calculation logic that integrates both subject-specific dates and overall student info
  const integratedCalculateFees = useCallback(() => {
    // Determine base rate based on branch and board
    let baseRate;
    if (studentBranch === "Online") {
      baseRate = 1500;
    } else {
      switch (studentBoard) {
        case "IGCSE":
          baseRate = 1200;
          break;
        case "IB":
          baseRate = 2500;
          break;
        case "NIOS":
          baseRate = 3000;
          break;
        case "CBSE":
        case "SSC":
          baseRate = 800;
          break;
        default:
          baseRate = 800;
      }
    }
    // Grade multiplier: early grades get no multiplier; numeric grades > 1 get a factor
    let gradeMultiplier = 1;
    const earlyGrades = ["Playschool", "Nurserry", "Jr. KG", "Sr. KG", "1"];
    if (!earlyGrades.includes(studentGrade)) {
      const gradeNum = parseInt(studentGrade);
      if (!isNaN(gradeNum) && gradeNum > 1) {
        gradeMultiplier = Math.pow(1.1, gradeNum - 1);
      }
    }
    const baseMonthlyRate = baseRate * gradeMultiplier;

    let subtotal = 0;
    const subjectFees = [];
    // Calculate fee for each selected subject (if valid dates & subject chosen)
    selectedSubjects.forEach((subject) => {
      if (subject.startDate && subject.endDate && subject.subject) {
        const days =
          dayjs(subject.endDate).diff(dayjs(subject.startDate), "days") + 1;
        let monthlyRate = baseMonthlyRate;
        if (oneToOneEnabled) {
          monthlyRate = baseMonthlyRate * (1 + oneToOnePercent / 100);
        }
        const dailyRate = monthlyRate / 30;
        const subjectFee = dailyRate * days;
        subjectFees.push({
          subject: subject.subject,
          fee: Math.round(subjectFee),
        });
        subtotal += subjectFee;
      }
    });
    subtotal = Math.round(subtotal);

    // Apply a subject discount if 3 or more subjects are selected
    const subjectDiscountPercentage = selectedSubjects.length >= 3 ? 10 : 0;
    const subjectDiscountAmount = Math.round(
      subtotal * (subjectDiscountPercentage / 100)
    );

    // Scholarship discount if enabled
    const scholarshipDiscountPercentage = scholarshipEnabled
      ? scholarshipPercent
      : 0;
    const scholarshipDiscountAmount = Math.round(
      subtotal * (scholarshipDiscountPercentage / 100)
    );

    const baseAmount =
      subtotal - subjectDiscountAmount - scholarshipDiscountAmount;
    const gstAmount = gstEnabled ? Math.round(baseAmount * 0.18) : 0;
    let finalTotal = baseAmount + gstAmount;

    // Determine an installment start date (use the earliest subject startDate)
    let installmentStartDate = new Date();
    const validDates = selectedSubjects
      .filter((s) => s.startDate)
      .map((s) => new Date(s.startDate));
    if (validDates.length > 0) {
      installmentStartDate = new Date(Math.min(...validDates));
    }
    let installments = calculateInstallments(finalTotal, installmentStartDate);

    // Prepare the initial breakdown object
    let breakdown = {
      subjectFees,
      subtotal,
      subjectDiscount: {
        percentage: subjectDiscountPercentage,
        amount: subjectDiscountAmount,
      },
      scholarshipDiscount: {
        percentage: scholarshipDiscountPercentage,
        amount: scholarshipDiscountAmount,
      },
      baseAmount,
      gstAmount,
      finalTotal,
      installments,
    };

    // If a custom total amount is provided, ignore discounts, GST, and 1:1.
    // Just split the custom total evenly among all subjects.
    if (customTotalAmount && !isNaN(customTotalAmount)) {
      const customTotal = parseFloat(customTotalAmount);
      if (customTotal > 0) {
        const subjectCount = breakdown.subjectFees.length || 1; // Prevent division by zero.
        const share = Math.round(customTotal / subjectCount);

        breakdown.subjectFees = breakdown.subjectFees.map((s) => ({
          subject: s.subject,
          fee: share,
        }));
        breakdown.subtotal = customTotal;
        breakdown.subjectDiscount = { percentage: 0, amount: 0 };
        breakdown.scholarshipDiscount = { percentage: 0, amount: 0 };
        breakdown.baseAmount = customTotal;
        breakdown.gstAmount = 0;
        breakdown.finalTotal = customTotal;
        breakdown.installments = calculateInstallments(
          customTotal,
          installmentStartDate
        );
      }
    }
    return breakdown;
  }, [
    selectedSubjects,
    studentBoard,
    studentBranch,
    studentGrade,
    oneToOneEnabled,
    oneToOnePercent,
    gstEnabled,
    scholarshipEnabled,
    scholarshipPercent,
    customTotalAmount,
  ]);

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
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Helper function to compute fee for an individual subject (if needed separately)
  const computeSubjectFee = (subjectItem) => {
    if (subjectItem.startDate && subjectItem.endDate && subjectItem.subject) {
      let baseRate;
      if (studentBranch === "Online") {
        baseRate = 1500;
      } else {
        switch (studentBoard) {
          case "IGCSE":
            baseRate = 1200;
            break;
          case "IB":
            baseRate = 2500;
            break;
          case "NIOS":
            baseRate = 3000;
            break;
          case "CBSE":
          case "SSC":
            baseRate = 800;
            break;
          default:
            baseRate = 800;
        }
      }
      let gradeMultiplier = 1;
      const earlyGrades = ["Playschool", "Nurserry", "Jr. KG", "Sr. KG", "1"];
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
      const days =
        dayjs(subjectItem.endDate).diff(dayjs(subjectItem.startDate), "days") +
        1;
      const subjectFee = dailyRate * days;
      return Math.round(subjectFee);
    }
    return 0;
  };

  // Modified save handler to send data to the backend
  const handleSaveStudent = async () => {
    // Validate required fields
    if (!studentName || !studentGrade || !studentBranch || !schoolName || !studentBoard || !academicYear) {
      alert("Please fill in all required student details");
      return;
    }

    // Validate address fields
    if (!area || !landmark || !city || !state || !pincode) {
      alert("Please fill in all address fields");
      return;
    }

    // Validate contact information
    if (phoneNumbers.length === 0) {
      alert("At least one contact is required");
      return;
    }

    for (const contact of phoneNumbers) {
      if (!contact.number || !contact.relation || !contact.name || 
          !contact.educationQualification || !contact.organization || 
          !contact.designation || !contact.department) {
        alert("Please fill in all contact information fields");
        return;
      }
    }

    const preparedSubjects = selectedSubjects.map((s, index) => ({
      name: s.subject,
      total: customTotalAmount && feeBreakdown && feeBreakdown.subjectFees[index]
        ? feeBreakdown.subjectFees[index].fee
        : computeSubjectFee(s),
      startDate: s.startDate ? new Date(s.startDate) : new Date(),
      endDate: s.endDate 
        ? new Date(s.endDate)
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }));

    const preparedContacts = phoneNumbers.map((p) => ({
      number: p.number,
      relation: p.relation.toLowerCase(),
      relationName: p.name,
      educationQualification: p.educationQualification,
      nameOfOrganisation: p.organization,
      designation: p.designation,
      Department: p.department,
      parentPhotoUrl: p.photoPreview || null
    }));

    const feeConfig = {
      basePrice: feeBreakdown?.subtotal || 0,
      gstApplied: gstEnabled,
      gstPercentage: gstEnabled ? 18 : 0,
      gstAmount: feeBreakdown?.gstAmount || 0,
      scholarshipApplied: scholarshipEnabled,
      scholarshipPercentage: scholarshipEnabled ? scholarshipPercent : 0,
      scholarshipAmount: feeBreakdown?.scholarshipDiscount?.amount || 0,
      oneToOneApplied: oneToOneEnabled,
      oneToOnePercentage: oneToOneEnabled ? oneToOnePercent : 0,
      oneToOneAmount: oneToOneEnabled
        ? Math.round((feeBreakdown?.subtotal || 0) * (oneToOnePercent / 100))
        : 0,
      baseAmount: feeBreakdown?.baseAmount || 0,
      totalAmount: feeBreakdown?.finalTotal || 0
    };

    // Map UI status values to schema enum values
    const statusMap = {
      "Admission Due": "admissiondue",
      "Active": "active",
      "Inactive": "inactive",
      "Completed": "completed"
    };
    
    const studentStatus = statusMap[status] || "admissiondue";

    const studentData = {
      studentName,
      grade: studentGrade,
      branch: studentBranch,
      board: studentBoard?.toUpperCase(),
      school: schoolName,
      academicYear,
      address: {
        area,
        landmark,
        city,
        state,
        pincode
      },
      status: studentStatus,
      phoneNumbers: preparedContacts,
      feeConfig,
      studentPhotoUrl: photoPreview || null,
      subjects: preparedSubjects
    };

    console.log("Saving student data:", studentData);

    try {
      const response = await api.post("/students", studentData);
      if (response.data.success) {
        alert("Student saved successfully!");
        // Reset form or redirect
      } else {
        alert("Error saving student: " + response.data.message);
      }
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Error saving student: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <MainFrame sx={{ p: 3 }}>
      {/* Header with action buttons */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: "bold",
            color: "#1a237e",
          }}
        >
          <AddIcon /> Add New Students
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          sx={{ bgcolor: "#4a90e2", color: "#964b00", borderRadius: "8px" }}
        >
          Download Template
        </Button>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          sx={{ bgcolor: "#fecc00", color: "#964b00", borderRadius: "8px" }}
        >
          Upload Excel
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ bgcolor: "#fecc00", color: "#964b00", borderRadius: "8px" }}
        >
          Add Manually
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Student Details Section */}
        <Grid item xs={12}>
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1a237e', fontWeight: 600 }}>
              Student Details
            </Typography>
            {/* Student Photo */}
            <Box sx={{mb: 2}}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Student Photo
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <Box sx={{ position: 'relative', width: 100, height: 100, borderRadius: '50%', overflow: 'hidden' }}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Student Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', backgroundColor: '#ccc' }}>
                      <BsUpload sx={{ fontSize: 40 }} />
                    </Box>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Student Name"
                  fullWidth
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={studentGrade}
                    label="Grade"
                    onChange={(e) => setStudentGrade(e.target.value)}
                  >
                    {["Playschool", "Nurserry", "Jr. KG", "Sr. KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"].map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        {grade}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Branch</InputLabel>
                  <Select
                    value={studentBranch}
                    label="Branch"
                    onChange={(e) => setStudentBranch(e.target.value)}
                  >
                    {["Goregoan West", "Goregoan East", "Online", "Borivali", "Kandivali", "Others"].map((branch) => (
                      <MenuItem key={branch} value={branch}>
                        {branch}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="School Name"
                  fullWidth
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Board</InputLabel>
                  <Select
                    value={studentBoard}
                    label="Board"
                    onChange={(e) => setStudentBoard(e.target.value)}
                  >
                    {["IGCSE", "CBSE", "SSC", "NIOS", "IB", "AS/A IBDP", "Others"].map((board) => (
                      <MenuItem key={board} value={board}>
                        {board}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={academicYear}
                    label="Academic Year"
                    onChange={(e) => setAcademicYear(e.target.value)}
                  >
                    {["2024-2025", "2025-2026"].map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {["Admission Due", "Active", "Inactive", "Completed"].map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Grid>
          
        {/* Address Details Section */}
        <Grid item xs={12}>
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1a237e', fontWeight: 600 }}>
              Address Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Area"
                  fullWidth
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Landmark"
                  fullWidth
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="City"
                  fullWidth
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="State"
                  fullWidth
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Pincode"
                  fullWidth
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
        
        {/* Contact Information Section */}
        <Grid item xs={12}>
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            mb: 3,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
                Contact Information
              </Typography>
              <Button
                variant="text"
                startIcon={<AddIcon />}
                size="small"
                sx={{ color: "primary.main" }}
                onClick={handleAddPhoneNumber}
              >
                Add Contact
              </Button>
            </Box>
            
            {phoneNumbers.map((phone) => (
              <Grid container spacing={2} key={phone.id} sx={{ ml: 0, mb: 4, backgroundColor: '#e7e7e7', p: 2, borderRadius: 2, width: '100%' }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Phone Number (with country code)"
                    required
                    value={phone.number}
                    onChange={(e) =>
                      handlePhoneNumberChange(phone.id, "number", e.target.value)
                    }
                    placeholder="+91XXXXXXXXXX"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contact Person's Name"
                    required
                    value={phone.name}
                    onChange={(e) =>
                      handlePhoneNumberChange(phone.id, "name", e.target.value)
                    }
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Relation</InputLabel>
                    <Select
                      value={phone.relation}
                      label="Relation"
                      onChange={(e) =>
                        handlePhoneNumberChange(
                          phone.id,
                          "relation",
                          e.target.value
                        )
                      }
                    >
                      {[
                        "Father",
                        "Mother",
                        "Guardian"
                      ].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1} container alignItems="center">
                  {phoneNumbers.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePhoneNumber(phone.id)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
                
                {/* Additional fields when relation is selected */}
                {phone.relation && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                        Additional Information for {phone.relation}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Education Qualification"
                        value={phone.educationQualification || ""}
                        onChange={(e) =>
                          handlePhoneNumberChange(phone.id, "educationQualification", e.target.value)
                        }
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Name of Organisation"
                        value={phone.organization || ""}
                        onChange={(e) =>
                          handlePhoneNumberChange(phone.id, "organization", e.target.value)
                        }
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Designation"
                        value={phone.designation || ""}
                        onChange={(e) =>
                          handlePhoneNumberChange(phone.id, "designation", e.target.value)
                        }
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Department"
                        value={phone.department || ""}
                        onChange={(e) =>
                          handlePhoneNumberChange(phone.id, "department", e.target.value)
                        }
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                        {phone.relation}'s Photo
                      </Typography>
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ position: 'relative', width: 80, height: 80, borderRadius: '50%', overflow: 'hidden' }}>
                          {phone.photoPreview ? (
                            <img src={phone.photoPreview} alt="Contact Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', backgroundColor: '#ccc' }}>
                              <BsUpload style={{ fontSize: 24 }} />
                            </Box>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleContactPhotoChange(phone.id, e)}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer',
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            ))}
          </Box>
        </Grid>

        {/* Subjects Section */}
        <Grid item xs={12}>
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>
                Subjects
              </Typography>
              <Button
                variant="text"
                startIcon={<AddIcon />}
                size="small"
                sx={{ color: "primary.main" }}
                onClick={handleAddSubject}
              >
                Add Subject
              </Button>
            </Box>
            
            {selectedSubjects.map((subjectItem, index) => (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: '40%' }}>
                  <FormControl size="medium"  sx={{ width: '100%' }} required>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={subjectItem.subject}
                      label="Subject"
                      onChange={(e) =>
                        handleSubjectChange(index, "subject", e.target.value)
                      }
                    >
                      {subjects
                        .filter(
                          (s) =>
                            !selectedSubjects.some(
                              (sel, i) => sel.subject === s.name && i !== index
                            )
                        )
                        .map((s) => (
                          <MenuItem key={s.name} value={s.name}>
                            {s.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={subjectItem.startDate}
                      onChange={(value) =>
                        handleSubjectChange(index, "startDate", value)
                      }
                      renderInput={(params) => (
                        <TextField {...params} size="small" fullWidth required />
                      )}
                    />
                  </LocalizationProvider>
                </Box>
                <Box sx={{ width: '25%' }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      value={subjectItem.endDate}
                      onChange={(value) =>
                        handleSubjectChange(index, "endDate", value)
                      }
                      renderInput={(params) => (
                        <TextField {...params} size="small" fullWidth required />
                      )}
                      minDate={subjectItem.startDate || dayjs()}
                      disabled={!subjectItem.startDate}
                    />
                  </LocalizationProvider>
                </Box>
                <Box sx={{ width: 'fit-content' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSubject(index)}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Fee Settings Section */}
        <Grid item xs={12}>
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            mb: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1a237e', fontWeight: 600 }}>
              Fee Settings
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
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
                sx={{
                  "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                }}
              />
              {/* Scholarship */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="medium"
                      checked={scholarshipEnabled}
                      onChange={(e) =>
                        handleScholarshipToggle(e.target.checked)
                      }
                    />
                  }
                  label={<Typography variant="body2">Scholarship</Typography>}
                  sx={{
                    "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                  }}
                />
                {scholarshipEnabled && (
                  <Select
                    value={scholarshipPercent}
                    onChange={(e) => setScholarshipPercent(e.target.value)}
                    sx={{ minWidth: 80, height: 32 }}
                  >
                    {[10, 20, 30, 40, 50].map((percent) => (
                      <MenuItem key={percent} value={percent}>
                        {percent}%
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Box>
              {/* 1:1 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="medium"
                      checked={oneToOneEnabled}
                      onChange={(e) => handleOneToOneToggle(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">1:1</Typography>}
                  sx={{
                    "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                  }}
                />
                {oneToOneEnabled && (
                  <Select
                    value={oneToOnePercent}
                    onChange={(e) => setOneToOnePercent(e.target.value)}
                    sx={{ minWidth: 80, height: 32 }}
                  >
                    {Array.from({ length: 20 }, (_, i) => (i + 1) * 10).map(
                      (percent) => (
                        <MenuItem key={percent} value={percent}>
                          {percent}%
                        </MenuItem>
                      )
                    )}
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
                sx={{
                  "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                }}
              />
            </Box>
            
            {/* Custom Total Amount input */}
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Custom Total Amount"
                type="number"
                size="small"
                value={customTotalAmount}
                onChange={(e) => setCustomTotalAmount(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {showUSD && usdRate ? "$" : "₹"}
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="textSecondary">
                Enter a custom total amount to adjust subject fees
                proportionally.
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Fee Details Section */}
        {feeBreakdown && (
          <Grid item xs={12}>
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: 1,
              mb: 3
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1a237e', fontWeight: 600 }}>
                Fee Details
              </Typography>
      
              {/* Display each subject's fee breakdown */}
              {feeBreakdown.subjectFees.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">{item.subject}</Typography>
                  <Typography variant="body2">
                    {formatAmount(item.fee)}
                  </Typography>
                </Box>
              ))}
      
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">
                  {formatAmount(feeBreakdown.subtotal)}
                </Typography>
              </Box>
              {feeBreakdown.subjectDiscount.amount > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">
                    Multi-subject Discount (
                    {feeBreakdown.subjectDiscount.percentage}%)
                  </Typography>
                  <Typography variant="body2" color="error">
                    -{formatAmount(feeBreakdown.subjectDiscount.amount)}
                  </Typography>
                </Box>
              )}
              {feeBreakdown.scholarshipDiscount.amount > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">
                    Scholarship ({feeBreakdown.scholarshipDiscount.percentage}%)
                  </Typography>
                  <Typography variant="body2" color="error">
                    -{formatAmount(feeBreakdown.scholarshipDiscount.amount)}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Base Amount</Typography>
                <Typography variant="body2">
                  {formatAmount(feeBreakdown.baseAmount)}
                </Typography>
              </Box>
              {gstEnabled && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">GST (18%)</Typography>
                  <Typography variant="body2">
                    {formatAmount(feeBreakdown.gstAmount)}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  pt: 1,
                  borderTop: "2px solid #e0e0e0",
                }}
              >
                <Typography variant="subtitle2">Final Total</Typography>
                <Typography variant="subtitle2">
                  {formatAmount(feeBreakdown.finalTotal)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Save Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            size="medium"
            fullWidth
            onClick={handleSaveStudent}
            sx={{ mt: 2, backgroundColor: "#fecc00", color: "#964b00", gap: 1 }}
          >
            <FiSave /> Save Student

          </Button>
        </Grid>
      </Grid>
    </MainFrame>
  );
};

export default Students;