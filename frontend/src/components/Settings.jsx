import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Upload } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FiSave, FiUserPlus } from "react-icons/fi";
import MainFrame from './ui/MainFrame';
import { TextFields } from '@mui/icons-material';

import Teachers from './Teachers';
import Students from './Students';
import NotFound from './NotFound';
import AddTeacher from './AddTeacher';
import AddStudents from './AddStudents';

const Settings = () => {

  const [selectedRole, setSelectedRole] = useState('teacher');

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      profilePic: null,
      name: '',
      email: '',
      password: '',
      role : ''
    }
  });

return (  
    <MainFrame>
      <Box sx={{ maxWidth: 1200, p: 4, mx: 'auto' }}>
        <Box sx={{ mb: 4, display: 'flex', gap: 1, alignItems: 'center' }}>
          <FiUserPlus size={22} color='#1a237e' strokeWidth={2} />
          <Typography variant="h6" component="h6" sx={{ color: '#1a237e', fontWeight: 600 }}>Add New {selectedRole}</Typography>
        </Box>
        
        <Box component="form" noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{
                      sx: { '& input': { fontSize: '14px' } }
                    }}
                    InputLabelProps={{
                      sx: { fontSize: '14px' }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{ required: 'Email is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{
                      sx: { '& input': { fontSize: '14px' } }
                    }}
                    InputLabelProps={{
                      sx: { fontSize: '14px' }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="password"
                control={control}
                rules={{ required: 'Password is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="password"
                    label="Password"
                    error={!!error}
                    helperText={error?.message}
                    InputProps={{
                      sx: { '& input': { fontSize: '14px' } }
                    }}
                    InputLabelProps={{
                      sx: { fontSize: '14px' }
                    }}
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
                {/* <MenuItem value="student">Student</MenuItem>x */}
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Conditional Rendering based on role */}
          {selectedRole === 'teacher' && <AddTeacher />}
          {selectedRole === 'student' && <AddStudents />}
          {selectedRole === 'admin' && 
            <Box sx={{pt: 4}}>
              <Button
                variant="contained"
                size="medium"
                fullWidth
                sx={{ mt: 2, backgroundColor: '#fecc00', color: '#964b00', gap: 1, margin: 0}}
              >< FiSave />
                Save Student
              </Button>
            </Box>
          }
        </Box>
      </Box>
    </MainFrame>
  );
};

export default Settings;