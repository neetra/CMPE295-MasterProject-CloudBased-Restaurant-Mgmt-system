import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';

import {
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import './ReservationForm.css';

function ReservationForm() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [phone, setPhone] = useState('');
  const restaurantId = useSelector((state) => state.restaurant.id);
  const restaurantImageURL = useSelector((state) => state.restaurant.imageURL);

  const data = {
    "customer_name": name,
    "location": location,
    "date": date,
    "time": time,
    "capacity": capacity,
    "customer_phone": phone
  };

  // (TESTING PURPOSES) Array of images for background
  // const images = [
  //   'https://images.unsplash.com/photo-1514518189759-94d8ee01ecf1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  //   'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80',
  //   'https://images.unsplash.com/photo-1496318447583-f524534e9ce1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1834&q=80',
  //   'https://images.unsplash.com/photo-1530006261244-0ae043004358?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  //   'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80',
  //   'https://images.unsplash.com/photo-1611143669185-af224c5e3252?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2532&q=80',
  //   'https://images.unsplash.com/photo-1594046243098-0fceea9d451e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  //   'https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  //   'https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  //   'https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  //   'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  // ];
  // Choose a random image for background
  // const randomIndex = Math.floor(Math.random() * images.length);
  // const randomImageUrl = images[randomIndex];

  const handleSubmit = (event) => {
    event.preventDefault();
    // Check if any value is empty
    if (!name || !location || !date || !time || !capacity || !phone) {
      alert('Please fill out all fields.');
      return;
    }
    // Submit form data to server
    axios.post('http://ec2-54-177-4-83.us-west-1.compute.amazonaws.com/newreservation', data)
      .then(response => {
        console.log(response.data);
        if (response.data.message === "table added successfully") {
          alert("Table reserved");
          // Redirect to homepage
          window.location.href = "/restaurant/:id";
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <Box className='table-reserve-container' sx={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${restaurantImageURL})` }}>
      <Box className='table-reserve-form' component='form' onSubmit={handleSubmit}>
        <Box className='table-reserve-header'>
          <Button component={Link} to={`/restaurant/${restaurantId}`}>
            <ArrowBackIcon />
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginRight: '41.99px' }}>
            Table Reservation
          </Typography>
          <Box></Box>
        </Box>
        <TextField
          id="name"
          label="Full Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <TextField
          id="location"
          label="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          required
        />
        <TextField
          id="date"
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <TextField
          id="time"
          label="Time"
          type="time"
          InputLabelProps={{ shrink: true }}
          value={time}
          onChange={(event) => setTime(event.target.value)}
          required
        />
        <TextField
          id="capacity"
          label="Number of Guests"
          type="number"
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          required
        />
        <TextField
          id="phone"
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
        <Button type="submit" variant="contained">Submit</Button>
      </Box>
    </Box>
  );
}

export default ReservationForm;

