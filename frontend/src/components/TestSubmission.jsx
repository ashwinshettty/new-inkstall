import { Close } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import React, { useState, useContext, useEffect } from "react";
import { BsUpload } from "react-icons/bs";
import { IoMdCheckmarkCircleOutline, IoMdDocument } from "react-icons/io";
import MainFrame from "./ui/MainFrame";
import axios from "axios";
import { StudentsContext } from "../context/StudentContext";
import { SubjectsContext } from "../context/SubjectsContext";
import api from "../api";

const TestSubmission = () => {
  // Date formatting utility
  const formatDate = (date) => {
    if (!date) return "";
    // Use en-GB locale with 2-digit day/month to get DD/MM/YYYY
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format date without time
  const formatSubmissionDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Today's date for submission date
  const today = new Date();
  const todayFormatted = formatDate(today);

  // Form state for test submission
  const [submissionDate] = useState(todayFormatted);
  const [proposedTestDate, setProposedTestDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [subject, setSubject] = useState("");
  const [chapters, setChapters] = useState([{ chapterName: "" }]);
  const [notes, setNotes] = useState("");
  const [uploadTestFileUrl, setUploadTestFileUrl] = useState("");
  // New state for storing the selected file for test sheet upload
  const [selectedFile, setSelectedFile] = useState(null);

  // Selected students state (initially empty)
  const [selectedStudents, setSelectedStudents] = useState([
    { name: "", grade: "" },
  ]);

  // Alert states
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  // Test submissions state
  const [testSubmissions, setTestSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState(null);

  // Use contexts for students and subjects
  const { students, loading: studentsLoading } = useContext(StudentsContext);
  const { subjects, loading: subjectsLoading } = useContext(SubjectsContext);

  // ------------------------------------------------------------------------
  // 1) Fetch test submissions and reverse them so newest appears on top
  // ------------------------------------------------------------------------
  const fetchTestSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const response = await api.get("/test-submissions");
      // Reverse the data so the most recent submission is first
      const reversed = response.data.slice().reverse();
      setTestSubmissions(reversed);
      setSubmissionsError(null);
    } catch (err) {
      console.error("Error fetching test submissions:", err);
      setSubmissionsError(
        "Failed to load test submissions. Please try again later."
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Initial fetch of test submissions
  useEffect(() => {
    fetchTestSubmissions();
  }, []);

  // Handlers for students
  const handleAddStudent = () => {
    setSelectedStudents([...selectedStudents, { name: "", grade: "" }]);
  };

  const handleRemoveStudent = (index) => {
    const updatedStudents = [...selectedStudents];
    updatedStudents.splice(index, 1);
    setSelectedStudents(updatedStudents);
  };

  const handleStudentChange = (index, newValue) => {
    const updatedStudents = [...selectedStudents];
    if (newValue) {
      updatedStudents[index] = { name: newValue.name, grade: newValue.grade };
    } else {
      updatedStudents[index] = { name: "", grade: "" };
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
    setChapters([...chapters, { chapterName: "" }]);
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

  // Handle file selection; store the file in state
  const handleFileUpload = (file) => {
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle form submission: first create test submission record, then if a file was selected, upload it
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
        // We will update uploadTestFileUrl once the file is uploaded
        uploadTestFileUrl: uploadTestFileUrl || "",
      },
    };

    console.log("Sending data to backend:", JSON.stringify(formData, null, 2));

    try {
      // Create test submission record
      const response = await api.post("/test-submissions", formData);
      const testSubmissionId = response.data._id;

      // If a file was selected, upload it using the same API endpoint but with fileType "test-sheet"
      if (selectedFile && testSubmissionId) {
        const fileFormData = new FormData();
        fileFormData.append("file", selectedFile);
        fileFormData.append("testSubmissionId", testSubmissionId); // Identifier for updating the record later
        fileFormData.append("subjectName", subject);
        // For simplicity, we take the first chapter's name
        fileFormData.append("chapterName", chapters[0].chapterName);
        fileFormData.append("fileType", "test-sheet");

        const uploadResponse = await api.post(
          "/daily-updates/upload-ksheet",
          fileFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        // Set the file URL in state so it appears in the UI
        setUploadTestFileUrl(uploadResponse.data.fileUrl);
      }

      setAlertMessage("Test submission created successfully!");
      setAlertSeverity("success");
      setOpenAlert(true);

      // Reset form
      setProposedTestDate("");
      setTotalMarks("");
      setSubject("");
      setChapters([{ chapterName: "" }]);
      setNotes("");
      setUploadTestFileUrl("");
      setSelectedStudents([{ name: "", grade: "" }]);
      setSelectedFile(null);

      // Fetch updated test submissions
      fetchTestSubmissions();

      console.log("Submission successful:", response.data);
    } catch (error) {
      setAlertMessage(
        `Error: ${error.response?.data?.message || "Failed to submit test"}`
      );
      setAlertSeverity("error");
      setOpenAlert(true);
      console.error("Submission error:", error);
    }
  };

  // ------------------------------------------------------------------------
  // 2) Function to handle viewing the file with credentials
  // ------------------------------------------------------------------------
  const handleViewFile = async (fileUrl) => {
    try {
      // We assume `fileUrl` is either an absolute URL or a relative path
      const response = await api.get(fileUrl, {
        responseType: "blob",
        withCredentials: true, // ensures cookies are sent
      });
      const fileBlob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const fileURL = URL.createObjectURL(fileBlob);
      // Open the file in a new tab
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error retrieving file:", error);
      setAlertMessage("Unable to view file. Check console for details.");
      setAlertSeverity("error");
      setOpenAlert(true);
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setOpenAlert(false);
  };

  // If either context is loading, show a loading indicator
  if (studentsLoading || subjectsLoading) return <div>Loading...</div>;

  return (
    <MainFrame>
      {/* Test Submission Form */}
      <Box
        sx={{
          p: 3,
          width: "70%",
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
          border: "1px solid #ccc",
          borderRadius: "8px",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IoMdCheckmarkCircleOutline size={32} color="#0000eb" />
          <Typography
            variant="h6"
            component="h6"
            sx={{ color: "#1a237e", fontWeight: 600 }}
          >
            Test Submission Form
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Submission Date */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
              <Typography variant="body1" component="label">
                Submission Date
              </Typography>
              <TextField fullWidth value={submissionDate} readOnly />
            </Box>

            {/* Proposed Test Date */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Proposed Test Date <span style={{ color: "red" }}>*</span>
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Total Marks (20-140) <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                type="number"
                inputProps={{ min: 1 }}
                required
              />
            </Box>

            {/* Students */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" component="label" required>
                  Students <span style={{ color: "red" }}>*</span>
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleAddStudent}
                  startIcon={<span>+</span>}
                  size="small"
                  sx={{
                    bgcolor: "#4285F4",
                    color: "white",
                    "&:hover": { bgcolor: "#3367d6" },
                  }}
                >
                  Add Student
                </Button>
              </Box>
              {selectedStudents.map((student, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  <Autocomplete
                    options={students}
                    getOptionLabel={(option) => option.name || ""}
                    value={
                      student.name
                        ? students.find((s) => s.name === student.name) || null
                        : null
                    }
                    onChange={(event, newValue) =>
                      handleStudentChange(index, newValue)
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select or search student..."
                        fullWidth
                        required
                      />
                    )}
                    sx={{ flex: 1 }}
                  />
                  {/* Grade input */}
                  <TextField
                    placeholder="Grade"
                    value={student.grade}
                    onChange={(e) => handleGradeChange(index, e.target.value)}
                    sx={{ width: "100px" }}
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1" component="label" required>
                Subject <span style={{ color: "red" }}>*</span>
              </Typography>
              <Autocomplete
                options={subjects}
                getOptionLabel={(option) => option.name || ""}
                value={
                  subject
                    ? subjects.find((s) => s.name === subject) || null
                    : null
                }
                onChange={(event, newValue) =>
                  setSubject(newValue ? newValue.name : "")
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Subject" required />
                )}
                fullWidth
              />
            </Box>

            {/* Chapters */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" component="label" required>
                  Chapters <span style={{ color: "red" }}>*</span>
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleAddChapter}
                  startIcon={<span>+</span>}
                  size="small"
                  sx={{
                    bgcolor: "#4285F4",
                    color: "white",
                    "&:hover": { bgcolor: "#3367d6" },
                  }}
                >
                  Add Chapter
                </Button>
              </Box>
              {chapters.map((chapter, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  <TextField
                    fullWidth
                    placeholder="Enter chapter name"
                    value={chapter.chapterName}
                    onChange={(e) => handleChapterChange(index, e.target.value)}
                    required
                  />
                  {chapters.length > 1 && (
                    <IconButton onClick={() => handleRemoveChapter(index)}>
                      <Close />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>

            {/* Subject Notes */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1" component="label">
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>

            {/* Upload Test File */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body1" component="label">
                Upload Test File
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<BsUpload />}
                sx={{
                  width: "fit-content",
                  borderColor: "#e0e0e0",
                  color: "#333",
                  textTransform: "none",
                  "&:hover": { borderColor: "#4285F4" },
                }}
              >
                Upload File
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </Button>
              {selectedFile && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  File selected: {selectedFile.name}
                </Typography>
              )}
              {uploadTestFileUrl && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  File uploaded: {uploadTestFileUrl.split("/").pop()}
                </Typography>
              )}
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#ffcc00",
                  color: "white",
                  py: 1.5,
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "#e6b800" },
                }}
              >
                Submit Test
              </Button>
            </Box>
          </Box>
        </form>
      </Box>

      {/* Test Correction Details Section */}
      <Box
        sx={{
          p: 3,
          width: "70%",
          position: "relative",
          left: "50%",
          transform: "translateX(-50%)",
          mb: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <IoMdDocument size={28} color="#1a237e" />
          <Typography
            variant="h6"
            component="h1"
            sx={{ color: "#1a237e", fontWeight: 600 }}
          >
            Test Correction Details
          </Typography>
        </Box>

        {loadingSubmissions ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "150px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : submissionsError ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error" variant="body1">
              {submissionsError}
            </Typography>
          </Box>
        ) : testSubmissions.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              border: "1px solid #eee",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body1">No test submissions found.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {testSubmissions.map((submission, index) => (
              <Card
                key={index}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent sx={{ p: 3, position: "relative" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Student Name(s)
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                        {submission.students
                          ?.map((student) => student.name)
                          .join(", ") || "N/A"}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Chapter Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                        {submission.subject?.chapters
                          ?.map((chapter) => chapter.chapterName)
                          .join(", ") || "N/A"}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Test File Location
                      </Typography>
                      {submission.subject?.uploadTestFileUrl ? (
                        // Instead of a direct anchor link, use a click handler that sends credentials
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#1976d2",
                            textDecoration: "underline",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleViewFile(submission.subject.uploadTestFileUrl)
                          }
                        >
                          Click here to view
                        </Typography>
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          No file uploaded
                        </Typography>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Subject
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                        {submission.subject?.name || "N/A"}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Total Marks
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                        {submission.totalMarks || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Proposed date displayed at bottom right */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ position: "absolute", bottom: 12, right: 16 }}
                  >
                    Submitted on:{" "}
                    {formatSubmissionDate(submission.proposedDate)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </MainFrame>
  );
};

export default TestSubmission;
