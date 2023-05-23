import React, { useState, useEffect } from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import {
  Typography,
  TextField,
  Button,
  Box
} from '@mui/material';
import { styled } from '@mui/system';

import { login } from '../Redux/authReducer.js';
import '../Styles/Login.css';
import { USERBASEURL } from '../constants.js';

const FormContainer = styled(Box)(({ theme }) => ({
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const Login = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const { id: restaurantId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    let userData = {
      username: username,
      password: password
    }

    // API call to login regular users or managers
    const res = await API.post('/auth', JSON.stringify(userData), {
      headers: headers
    }).then((res) => res).catch(function (error) {
      console.log(error);
    });

    if (res && res.status === 200) {
      const user = jwt_decode(res.data.access_token);
      if(user.Role_id === 3 && user.Status_id !== 1) {
        setIsError(true);
      } else {
        dispatch(login(user))
        setUser(user)
        if (user && user.Role_id === 3) {
          navigate(`/restaurant/${user.Restaurant_id}`)
        } else if(user && user.Role_id === 2) {
          navigate(`/admin`)
        } else {
          navigate(`/restaurant/${restaurantId}`)
        }
        setIsError(false);
      }
    } else {
      setIsError(true);
      console.log('Incorrect Credentials!')
    }
  }

  useEffect(() => {
    if (user && user.Role_id === 3) {
      navigate(`/restaurant/${user.Restaurant_id}`)
    } else if (user && user.Role_id === 2) {
      navigate(`/admin`)
    } else if (user) {
      navigate(`/restaurant/${restaurantId}`)
    }
  }, [user, navigate, restaurantId])

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Typography variant="h4" component="h1">Manager Login</Typography>
      <FormContainer component="form" onSubmit={(event) => handleSubmit(event)} width="100%" maxWidth={450} mt={3}>
        <TextField
          fullWidth
          required
          label="Username"
          type="text"
          onChange={(event) => setUsername(event.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          required
          label="Password"
          type="password"
          onChange={(event) => setPassword(event.target.value)}
          margin="normal"
        />
        <SubmitButton id="submitButton" type="submit" variant="contained" color="primary" fullWidth>Login</SubmitButton>
      </FormContainer>
      {isError && (
        <Typography variant="body2" color="error" mt={2}>
          Incorrect credentials or user doesn't exist, try again!
        </Typography>
      )}
    </Box>
  );
}

export default Login;