import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';

import { USERBASEURL } from '../constants.js';

const textFieldStyle = {
  width: "80%",
};

const Register = ({ role, rest_id }) => {
    const [isError, setIsError] = useState(false);
    const [FName, setFName] = useState('');
    const [LName, setLName] = useState('');
    const [Password, setPassword] = useState('');
    const [PasswordConfirm, setPasswordConfirm] = useState('');
    const [EmailId, setEmailId] = useState('');
    const [EmailIdConfirm, setEmailIdConfirm] = useState('');
    // const [RoleId, setRoleId] = useState(role);
    // const [RestaurantId, setRestaurantId] = useState(rest_id);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [alertMessage, setAlertMessage] = useState(null);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [formKey, setFormKey] = useState(0); // Used to re-render form to reset it
  
    const API = axios.create({ baseURL: USERBASEURL })
  
    API.interceptors.request.use((req) => {
      if (localStorage.getItem('profile')) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`
      }
    
      return req;
    });  
  
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'JWT'
    }

    // Validates form by confirming email and password
    const validateForm = () => {
      let isValid = true;
      
      if (EmailId !== EmailIdConfirm) {
        isValid = false;
        setEmailError('Email addresses do not match.');
      } else {
        setEmailError('');
      }
    
      if (Password !== PasswordConfirm) {
        isValid = false;
        setPasswordError('Passwords do not match.');
      } else {
        setPasswordError('');
      }
    
      return isValid;
    };
    
    
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      let userData = {
        FName: FName,
        LName: LName,
        Password: Password,
        PasswordConfirm: PasswordConfirm,
        EmailId: EmailId,
        EmailIdConfirm: EmailIdConfirm,
        RoleId: role,
        RestaurantId: rest_id
      }

      if (!validateForm()) {
        setSnackbarOpen(!!alertMessage);
        return;
      }
    
      // API call to register a new user
      const res = await API.post('/user', JSON.stringify(userData), {
        headers: headers
      }).then((res) => res).catch((error) => console.log(error));
      console.log(res)
      if (res && res.status === 200) {
        setAlertSeverity('success');
        setAlertMessage('User Created Successfully!');
        setIsError(false);
        // prevKey -> previous state of formKey before update, ensures latest state value
        setFormKey((prevKey) => prevKey + 1);
      } else {
        setAlertSeverity('error');
        setAlertMessage('Error Creating User.');
        setIsError(true);
      }
      setSnackbarOpen(true);
    }

  return (
    <Box
      sx={{
        marginTop: 4,
        display: "flex",
        justifyContent: "center",
        width: '100%',
      }}
    >
      <Box
        component="form"
        key={formKey}
        onSubmit={(event) => handleSubmit(event)}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          padding: 2,
          borderRadius: 3,
          boxShadow: 3,
          width: '60%',
        }}
      >
        <Typography variant="h5" component="u">
          User Registration
        </Typography>
        <TextField
          required
          label="First Name"
          type="text"
          onChange={(event) => setFName(event.target.value)}
          sx={textFieldStyle}
        />
        <TextField
          required
          label="Last Name"
          type="text"
          onChange={(event) => setLName(event.target.value)}
          sx={textFieldStyle}
        />
        <TextField
          required
          label="Email"
          type="email"
          onChange={(event) => setEmailId(event.target.value)}
          sx={textFieldStyle}
        />
        <TextField
          required
          label="Confirm Email"
          type="email"
          onChange={(event) => setEmailIdConfirm(event.target.value)}
          error={!!emailError}
          helperText={emailError}
          sx={textFieldStyle}
        />
        <TextField
          required
          label="Password"
          type="password"
          onChange={(event) => setPassword(event.target.value)}
          sx={textFieldStyle}
        />
        <TextField
          required
          label="Confirm Password"
          type="password"
          onChange={(event) => setPasswordConfirm(event.target.value)}
          error={!!passwordError}
          helperText={passwordError}
          sx={textFieldStyle}
        />
        <Button id="employeeButton" type="submit" variant="contained">
          Register
        </Button>
        {isError ? (
          <Typography variant="body1" color="error">
            Invalid info or user already exists, please try again!
          </Typography>
        ) : null}
      </Box>

      <Snackbar
        open={snackbarOpen && !!alertMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={alertSeverity}
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Register;