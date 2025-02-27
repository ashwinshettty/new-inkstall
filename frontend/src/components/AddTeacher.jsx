import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { LocalizationProvider, TimePicker, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Upload } from "lucide-react";

const AddTeacher = () => {
  const { register, control, setValue, watch } = useFormContext();

  // Default times as strings
  const defaultStartTime = "09:00";
  const defaultEndTime = "17:00";

  const subjects = [
    "Psychology",
    "Global Perspectives",
    "Physical Education",
    "Geography",
    "Combined Science",
    "Phonics",
    "Environmental Management",
    "Economics",
    "French",
    "Mathematics - Core and Extended",
    "Computer Science",
    "Commerce",
    "History",
    "Sanskrit",
    "Spanish",
    "UOI",
    "Art and Design",
    "International Mathematics",
    "German",
    "Marathi",
    "Music",
    "English - First Language",
    "Drama",
    "English as a Second Language",
    "Sociology",
    "Physics",
    "Accounting",
    "Mandarin Chinese",
    "Design and Technology",
    "Chemistry",
    "Hindi",
    "ICT",
    "Co-ordinated Sciences",
    "Biology",
    "Business Studies",
    "Additional Mathematics",
  ];

  // Days keys matching your schema
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const handleFileChange = (field) => (event) => {
    setValue(field, event.target.files[0]);
  };

  return (
    <Box sx={{ maxWidth: 1200, pt: 4, mx: "auto" }}>
      {/* Profile Photo Upload */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
        <Box
          sx={{
            width: 110,
            height: 110,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
            cursor: "pointer",
            bgcolor: "#f5f5f5",
            borderRadius: "50%",
          }}
        >
          <input
            type="file"
            id="profilePhoto"
            hidden
            accept="image/*"
            {...register("profilePhoto")}
            onChange={handleFileChange("profilePhoto")}
          />
          <label htmlFor="profilePhoto" style={{ cursor: "pointer" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Upload size={24} color="#666" />
            </Box>
          </label>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontSize: "16px" }}>
            Photo
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              component="span"
              sx={{ fontSize: "14px", fontWeight: 500 }}
            >
              Choose File
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontSize: "14px" }}
            >
              {watch("profilePhoto")?.name || "No file chosen"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Controller
            name="startingDate"
            control={control}  // Changed from methods.control to control
            rules={{ required: "Starting Date is required" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Starting Date"
                  value={value ? dayjs(value, "DD:MM:YYYY") : null}
                  onChange={(newValue) =>
                    onChange(newValue ? newValue.format("DD:MM:YYYY") : "")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{ sx: { "& input": { fontSize: "14px" } } }}
                      InputLabelProps={{ sx: { fontSize: "14px" } }}
                    />
                  )}
                />
              </LocalizationProvider>
            )}
          />
        </Grid>
      </Grid>

      {/* About Me Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontSize: "16px" }}>
          About Me
        </Typography>
        <Controller
          name="aboutMe" // Matches schema field "aboutMe"
          control={control}
          rules={{ required: "About Me is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={4}
              placeholder="Write a brief description about yourself..."
              error={!!error}
              helperText={error?.message}
              InputProps={{ sx: { "& textarea": { fontSize: "14px" } } }}
              InputLabelProps={{ sx: { fontSize: "14px" } }}
            />
          )}
        />
      </Box>

      {/* Subjects */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontSize: "16px" }}>
          Subjects
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {subjects.map((subject) => (
            <Controller
              key={subject}
              name="subjects"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value.includes(subject)}
                      onChange={(e) => {
                        const newSubjects = e.target.checked
                          ? [...field.value, subject]
                          : field.value.filter((s) => s !== subject);
                        field.onChange(newSubjects);
                      }}
                      sx={{ "& .MuiSvgIcon-root": { fontSize: "1rem" } }}
                    />
                  }
                  label={subject}
                  sx={{
                    margin: 0,
                    "& .MuiFormControlLabel-label": { fontSize: "14px" },
                  }}
                />
              )}
            />
          ))}
        </Box>
      </Box>

      {/* Document Upload (Offer Letter, optional) */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, fontSize: "16px" }}>
          Offer Letter (Optional)
        </Typography>
        <input
          type="file"
          id="document"
          hidden
          {...register("document")}
          onChange={handleFileChange("document")}
        />
        <label htmlFor="document">
          <IconButton component="span">
            <Upload size={20} />
          </IconButton>
        </label>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontSize: "14px" }}
        >
          {watch("document")?.name || "Choose File: No file chosen"}
        </Typography>
      </Box>

      {/* Salary Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontSize: "16px" }}>
          Salary
        </Typography>
        <Controller
          name="salary.type"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} row sx={{ mb: 1 }}>
              <FormControlLabel
                value="hourly"
                control={<Radio size="small" />}
                label="Hourly Rate"
                sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
              />
              <FormControlLabel
                value="monthly"
                control={<Radio size="small" />}
                label="Monthly Salary"
                sx={{ "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
              />
            </RadioGroup>
          )}
        />
        <Controller
          name="salary.amount"
          control={control}
          rules={{ required: "Salary is required" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label={
                watch("salary.type") === "hourly"
                  ? "Hourly Rate (₹/hr)"
                  : "Monthly Salary (₹)"
              }
              error={!!error}
              helperText={error?.message}
              size="small"
              sx={{
                "& .MuiInputBase-root": { fontSize: "14px" },
                "& .MuiInputLabel-root": { fontSize: "14px" },
              }}
              InputProps={{
                startAdornment: (
                  <Typography sx={{ fontSize: "14px", mr: 0.5 }}>₹</Typography>
                ),
                inputProps: {
                  min: 0,
                  step: watch("salary.type") === "hourly" ? "0.01" : "1",
                },
              }}
            />
          )}
        />
      </Box>

      {/* Work Hours */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontSize: "16px" }}>
          Work Hours
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={3}>
            {days.map((day) => (
              <Grid item xs={12} sm={6} key={day}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography sx={{ minWidth: 100, fontSize: "14px" }}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flex: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Start Time using key startTime */}
                    <Controller
                      name={`workingHours.${day}.startTime`}
                      control={control}
                      render={({ field: { onChange, value, ...restField } }) => (
                        <TimePicker
                          {...restField}
                          label="Start Time"
                          value={
                            value
                              ? dayjs(value, "HH:mm")
                              : dayjs(defaultStartTime, "HH:mm")
                          }
                          onChange={(newValue) =>
                            onChange(newValue ? newValue.format("HH:mm") : "")
                          }
                          slotProps={{
                            textField: {
                              size: "small",
                              sx: {
                                "& .MuiInputBase-input": { fontSize: "14px" },
                                "& .MuiInputLabel-root": { fontSize: "14px" },
                              },
                            },
                          }}
                          sx={{ flex: 1 }}
                        />
                      )}
                    />
                    {/* End Time using key endTime */}
                    <Controller
                      name={`workingHours.${day}.endTime`}
                      control={control}
                      render={({ field: { onChange, value, ...restField } }) => (
                        <TimePicker
                          {...restField}
                          label="End Time"
                          value={
                            value
                              ? dayjs(value, "HH:mm")
                              : dayjs(defaultEndTime, "HH:mm")
                          }
                          onChange={(newValue) =>
                            onChange(newValue ? newValue.format("HH:mm") : "")
                          }
                          slotProps={{
                            textField: {
                              size: "small",
                              sx: {
                                "& .MuiInputBase-input": { fontSize: "14px" },
                                "& .MuiInputLabel-root": { fontSize: "14px" },
                              },
                            },
                          }}
                          sx={{ flex: 1 }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </LocalizationProvider>
      </Box>
    </Box>
  );
};

export default AddTeacher;
