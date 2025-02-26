import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Upload } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FiUserPlus } from "react-icons/fi";
import MainFrame from './ui/MainFrame';


const AddTeacher = () => {
  const defaultStartTime = dayjs().set('hour', 9).set('minute', 0);
  const defaultEndTime = dayjs().set('hour', 17).set('minute', 0);

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
    "Additional Mathematics"
  ];

  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      profilePic: null,
      name: '',
      email: '',
      password: '',
      joiningDate: '',
      description: '',
      subjects: [],
      document: null,
      salaryType: 'monthly',
      salary: '',
      timings: Array(7).fill().map(() => ({
        start: defaultStartTime,
        end: defaultEndTime
      }))
    }
  });

  // const handleTimeChange = (day, type, newValue) => {
  //   setValue(`timings.${day}.${type}`, newValue);
  // };

  const handleFileChange = (field) => (event) => {
    setValue(field, event.target.files[0]);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const onSubmit = async (data) => {
    console.log({
      ...data,
      subjects: data.subjects
    });
  };
  

  return (  
      <>
      <Box sx={{ maxWidth: 1200, pt: 4, mx: 'auto' }}>          
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Profile Picture */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2}}>
            
            {/* Profile Picture Upload */}
            <Box sx={{ 
              width: 110,
              height: 110,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              cursor: 'pointer',
              bgcolor: '#f5f5f5',
              borderRadius: '50%'
            }}>
              <input
                type="file"
                id="profilePic"
                hidden
                accept="image/*"
                {...register('profilePic')}
                onChange={handleFileChange('profilePic')}
              />
              <label htmlFor="profilePic" style={{ cursor: 'pointer' }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 1 
                }}>
                  <Upload size={24} color="#666" />
                </Box>
              </label>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontSize: '16px' }}>Photo</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                      component="span" 
                      sx={{ 
                          fontSize: '14px',
                          fontWeight: 500,
                      }}
                  >
                      Choose File
                  </Typography>
                  <Typography 
                      variant="body2" 
                      color="textSecondary" 
                      sx={{ 
                          fontSize: '14px'
                      }}
                  >
                      {watch('profilePic')?.name || 'No file chosen'}
                  </Typography>
              </Box>
              </Box>
          </Box>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Controller
                name="joiningDate"
                control={control}
                rules={{ required: 'Joining Date is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Joining Date"
                    InputLabelProps={{ 
                      shrink: true,
                      sx: { fontSize: '14px' }
                    }}
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{
                      sx: { '& input': { fontSize: '14px' } }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* About Me */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontSize: '16px' }}>About Me</Typography>
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Write a brief description about yourself..."
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{
                    sx: { '& textarea': { fontSize: '14px' } }
                  }}
                  InputLabelProps={{
                    sx: { fontSize: '14px' }
                  }}
                />
              )}
            />
          </Box>

          {/* Subjects */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '16px' }}>Subjects</Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 2
            }}>
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
                              ? [...field.value, subject] // Add subject if checked
                              : field.value.filter((s) => s !== subject); // Remove if unchecked
                            field.onChange(newSubjects);
                          }}
                          sx={{ '& .MuiSvgIcon-root': { fontSize: '1rem' } }}
                        />
                      }
                      label={subject}
                      sx={{
                        margin: 0,
                        '& .MuiFormControlLabel-label': { fontSize: '14px' }
                      }}
                    />
                  )}
                />
              ))}
            </Box>
          </Box>

          {/* Document Upload */}
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontSize: '16px' }}>Offer Letter (Optional)</Typography>
            <input
              type="file"
              id="document"
              hidden
              {...register('document')}
              onChange={handleFileChange('document')}
            />
            <label htmlFor="document">
              <IconButton component="span">
                <Upload size={20} />
              </IconButton>
            </label>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '14px' }}>
              {watch('document')?.name || 'Choose File: No file chosen'}
            </Typography>
          </Box>

          {/* Salary */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontSize: '16px' }}>Salary Type</Typography>
            <Controller
              name="salaryType"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  row
                  sx={{ mb: 1 }}
                >
                  <FormControlLabel 
                    value="hourly" 
                    control={<Radio size="small" />} 
                    label="Hourly Rate" 
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        fontSize: '14px' 
                      } 
                    }} 
                  />
                  <FormControlLabel 
                    value="monthly" 
                    control={<Radio size="small" />} 
                    label="Monthly Salary" 
                    sx={{ 
                      '& .MuiFormControlLabel-label': { 
                        fontSize: '14px' 
                      } 
                    }} 
                  />
                </RadioGroup>
              )}
            />
            <Controller
              name="salary"
              control={control}
              rules={{ required: 'Salary is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label={watch('salaryType') === 'hourly' ? 'Hourly Rate (₹/hr)' : 'Monthly Salary (₹)'}
                  error={!!error}
                  helperText={error?.message}
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: '14px',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '14px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <Typography sx={{ fontSize: '14px', mr: 0.5 }}>₹</Typography>
                    ),
                    inputProps: { 
                      min: 0,
                      step: watch('salaryType') === 'hourly' ? '0.01' : '1'
                    }
                  }}
                />
              )}
            />
          </Box>

          {/* Work Hours */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontSize: '16px' }}>Work Hours</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3}>
                {days.map((day, index) => (
                  <Grid item xs={12} sm={6} key={day}>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <Typography sx={{ minWidth: 100, fontSize: '14px' }}>{day}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'space-between' }}>
                        <Controller
                          name={`timings.${index}.start`}
                          control={control}
                          render={({ field }) => (
                            <TimePicker
                              {...field}
                              label="Start Time"
                              slotProps={{
                                textField: {
                                  size: "small",
                                  sx: {
                                    '& .MuiInputBase-input': { fontSize: '14px' },
                                    '& .MuiInputLabel-root': { fontSize: '14px' }
                                  }
                                }
                              }}
                              sx={{ flex: 1 }}
                            />
                          )}
                        />
                        <Controller
                          name={`timings.${index}.end`}
                          control={control}
                          render={({ field }) => (
                            <TimePicker
                              {...field}
                              label="End Time"
                              slotProps={{
                                textField: {
                                  size: "small",
                                  sx: {
                                    '& .MuiInputBase-input': { fontSize: '14px' },
                                    '& .MuiInputLabel-root': { fontSize: '14px' }
                                  }
                                }
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

          {/* Submit Button */}
          <Box sx={{ mt: 6 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                bgcolor: '#fdd835',
                color: '#000',
                px: 4,
                fontSize: '14px',
                '&:hover': {
                  bgcolor: '#fbc02d'
                }
              }}
            >
              Add Teacher
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AddTeacher;