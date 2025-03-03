import React, { useState } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { FiSave, FiUserPlus } from "react-icons/fi";
import MainFrame from "./ui/MainFrame";
import api from "../api";
import AddTeacher from "./AddTeacher";
import AddStudents from "./AddStudents";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Settings = () => {
  const [selectedRole, setSelectedRole] = useState("teacher");

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  // Default working hours using keys startTime and endTime
  const defaultWorkingHours = {
    monday: {
      startTime: dayjs().set("hour", 9).set("minute", 0).format("HH:mm"),
      endTime: dayjs().set("hour", 17).set("minute", 0).format("HH:mm"),
    },
    tuesday: {
      startTime: dayjs().set("hour", 9).set("minute", 0).format("HH:mm"),
      endTime: dayjs().set("hour", 17).set("minute", 0).format("HH:mm"),
    },
    wednesday: {
      startTime: dayjs().set("hour", 9).set("minute", 0).format("HH:mm"),
      endTime: dayjs().set("hour", 17).set("minute", 0).format("HH:mm"),
    },
    thursday: {
      startTime: dayjs().set("hour", 9).set("minute", 0).format("HH:mm"),
      endTime: dayjs().set("hour", 17).set("minute", 0).format("HH:mm"),
    },
    friday: {
      startTime: dayjs().set("hour", 9).set("minute", 0).format("HH:mm"),
      endTime: dayjs().set("hour", 17).set("minute", 0).format("HH:mm"),
    },
    saturday: {
      startTime: dayjs().set("hour", 9).set("minute", 0).format("HH:mm"),
      endTime: dayjs().set("hour", 17).set("minute", 0).format("HH:mm"),
    },
    sunday: {
      startTime: dayjs().set("hour", 9).set("minute", 0).format("HH:mm"),
      endTime: dayjs().set("hour", 17).set("minute", 0).format("HH:mm"),
    },
  };

  // Initialize the form with default values matching the teacher schema.
  const methods = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
      profilePhotourl: "",
      localPhotoUrl: "", // Add local photo URL
      fileName: "", // Add filename for reference
      startingDate: "",
      aboutMe: "",
      subjects: [],
      document: null,
      salary: { type: "monthly", amount: "" },
      workingHours: defaultWorkingHours,
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data) => {
    // Set role from the dropdown selection
    data.role = selectedRole;

    try {
      // Get the profilePhoto from AddTeacher component via form state
      const photoFile = data.photoFile;
      
      // If there's a photo file to upload, upload it first
      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);
        
        const photoResponse = await api.post("/upload/photo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        if (photoResponse.data.success) {
          // Update the data with the uploaded photo URLs
          data.profilePhotourl = photoResponse.data.nextCloudUrl;
          data.localPhotoUrl = photoResponse.data.localUrl;
          data.fileName = photoResponse.data.fileName;
        } else {
          throw new Error(photoResponse.data.message || "Photo upload failed");
        }
      }
      
      // Remove the temporary photoFile field from data before sending to server
      delete data.photoFile;

      const response = await api.post("/auth/users", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("User added successfully:", response.data);

      if (selectedRole === "teacher") {
        toast.success("Teacher created successfully!");
      } else {
        const capitalizedRole =
          selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
        toast.success(`${capitalizedRole} created successfully!`);
      }

      reset(); // Reset the form after success.
    } catch (error) {
      console.error("Error during submission:", error);

      if (error.response && error.response.data && error.response.data.error) {
        toast.error("Error: " + error.response.data.error);
      } else if (error.response && error.response.statusText) {
        toast.error("Error: " + error.response.statusText);
      } else {
        toast.error("Error: " + error.message);
      }
    }
  };

  return (
    <MainFrame>
      <Box sx={{ maxWidth: 1200, p: 4, mx: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", gap: 1, alignItems: "center" }}>
          <FiUserPlus size={22} color="#1a237e" strokeWidth={2} />
          <Typography
            variant="h6"
            component="h6"
            sx={{ color: "#1a237e", fontWeight: 600 }}
          >
            Add New {selectedRole}
          </Typography>
        </Box>
        <FormProvider {...methods}>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={methods.control}
                  rules={{ required: "Name is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Full Name"
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{ sx: { "& input": { fontSize: "14px" } } }}
                      InputLabelProps={{ sx: { fontSize: "14px" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={methods.control}
                  rules={{ required: "Email is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{ sx: { "& input": { fontSize: "14px" } } }}
                      InputLabelProps={{ sx: { fontSize: "14px" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="password"
                  control={methods.control}
                  rules={{ required: "Password is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="password"
                      label="Password"
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{ sx: { "& input": { fontSize: "14px" } } }}
                      InputLabelProps={{ sx: { fontSize: "14px" } }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  size="medium"
                  defaultValue="teacher"
                  value={selectedRole}
                  onChange={handleRoleChange}
                >
                  <MenuItem value="teacher">Teacher</MenuItem>
                  {/* Uncomment to add student */}
                  {/* <MenuItem value="student">Student</MenuItem> */}
                  <MenuItem value="admin">Admin</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Conditionally render teacher or student-specific fields */}
            {selectedRole === "teacher" && <AddTeacher />}
            {selectedRole === "student" && <AddStudents />}

            <Box sx={{ pt: 4 }}>
              <Button
                variant="contained"
                size="medium"
                fullWidth
                type="submit"
                sx={{
                  mt: 2,
                  backgroundColor: "#fecc00",
                  color: "#964b00",
                  gap: 1,
                  margin: 0,
                }}
              >
                <FiSave />
                Save{" "}
                {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </Button>
            </Box>
          </Box>
        </FormProvider>
      </Box>
    </MainFrame>
  );
};

export default Settings;