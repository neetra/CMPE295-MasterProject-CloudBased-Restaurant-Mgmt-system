import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Button, 
  Stack, 
  Box,
  Typography
} from '@mui/material';

import { setRestaurantId, setRestaurantName, setRestaurantImage } from '../Redux/restaurantSlice.js';
import { logout } from '../Redux/authReducer.js';
import { login } from '../Redux/authReducer.js';
import { MENUBASEURL } from '../constants.js';
import '../Styles/HomePage.css';

function HomePage() {
  const { id: restaurantId } = useParams();
  const restaurantName = useSelector((state) => state.restaurant.name);
  const restaurantImageURL = useSelector((state) => state.restaurant.imageURL);
  // const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
    // const user = JSON.parse(localStorage.getItem('profile'));
  const [user, setUser] = useState(
    localStorage.getItem('profile') && JSON.parse(localStorage.getItem('profile')).length !== 0
      ? JSON.parse(localStorage.getItem('profile'))
      : null
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRestaurantName = async (restaurantId) => {
      try {
        // API call to get all restaurants to retrieve restaurant name and image URL given a restaurant ID
        const response = await axios.get(`${MENUBASEURL}/restaurants`);
        const restaurant = response.data.find((restaurant) => restaurant.Restaurant_id === restaurantId);
    
        if (restaurant) {
          dispatch(setRestaurantName(restaurant.Restaurant_name));
          dispatch(setRestaurantImage(restaurant.Restaurant_image_url));
        } else {
          console.error(`Restaurant with ID ${restaurantId} not found.`);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant name and/or image:', error);
      }
    };

    // Put the user information into Redux state if it exists
    if(user !== null && Object.keys(user).length !== 0) {
      dispatch(login(user))
      setUser(user)
    }
    
    dispatch(setRestaurantId(restaurantId));
    fetchRestaurantName(restaurantId);
  }, [dispatch, restaurantId, user]);

  return (

    user === null ?

    <Box 
      className="main-container" 
      sx={{ 
        backgroundImage: restaurantImageURL
          ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${restaurantImageURL})`
          : ''
        }}
      >
      <Typography 
        variant="h4" 
        sx={{ 
          margin: "20px", 
          color: restaurantImageURL ? "white" : "black"
        }}
      >
        Welcome to {restaurantName}!
      </Typography>
      {/* {restaurantImageURL && (
        <Box
          sx={{
            minHeight: "250px",
            width: "90%",
            marginBottom: "30px",
            backgroundImage: `url(${restaurantImageURL})`,
          }}
        >
        </Box>
      )} */}
      <Stack spacing={2} direction="row">
        <Button className="homepage-button" variant="contained" component={Link} to={`/reserve`}>
          Reserve Table
        </Button>
        <Button className="homepage-button" variant="contained" component={Link} to={`/restaurant/${restaurantId}/menu`}>
          View Menu & Order
        </Button>
      </Stack>
    </Box>

    : user.Role_id === 1 ?

    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box 
        className="main-container" 
        sx={{ 
          backgroundImage: restaurantImageURL
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${restaurantImageURL})`
            : ''
          }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            margin: "20px", 
            color: restaurantImageURL ? "white" : "black"
          }}
        >
          Welcome to {restaurantName}!
        </Typography>
        <Stack spacing={2} direction="row">
          <Button variant="contained" component={Link}>
            Reserve Table
          </Button>
          <Button className="homepage-button" variant="contained" component={Link} to={`/restaurant/${restaurantId}/menu`}>
            View Menu & Order
          </Button>
          <Button className="homepage-button" variant="contained" onClick={() => {dispatch(logout()); navigate(`/restaurant/${restaurantId}`);}}>
            Logout
          </Button>
        </Stack>
      </Box>
    </Box>

    : user.Role_id === 2 ? 

    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>Restaurant Management ({restaurantName})</h1>
      <Stack spacing={2} direction="row">
      <Button variant="contained" component={Link}>
          Manage Tables
        </Button>
        <Button variant="contained" component={Link} to={`/restaurant/${restaurantId}/menu`}>
          Manage Menu
        </Button>
        <Button variant="contained" color="secondary" component={Link} to={`/restaurant/${restaurantId}/manager`}>
          Manager Dashboard
        </Button>
        <Button variant="contained" color="secondary" component={Link} to={`/admin`}>
          Admin Dashboard
        </Button>
        <Button variant="contained" color="error" onClick={() => {dispatch(logout()); navigate(`/admin`);}}>
          Logout
        </Button>
      </Stack>
    </Box>

    : (user.Role_id === 3 && user.Restaurant_id === restaurantId) ? 

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1>Restaurant Management ({restaurantName})</h1>
        <Stack spacing={2} direction="row">
        <Button variant="contained" component={Link}>
            Manage Tables
          </Button>
          <Button variant="contained" component={Link} to={`/restaurant/${restaurantId}/menu`}>
            Manage Menu
          </Button>
          <Button variant="contained" color="secondary" component={Link} to={`/restaurant/${restaurantId}/manager`}>
            Manager Dashboard
          </Button>
          <Button variant="contained" color={"error"} onClick={() => {dispatch(logout()); navigate(`/login`);}}>
            Logout
          </Button>
        </Stack>
      </Box>

    : (user.Role_id === 3 && user.Restaurant_id !== restaurantId) ?

    <Box>
      <Typography variant='h4' sx={{ margin: '100px' }}>You do not have permission to view this resource!</Typography>
      <Button variant="contained" component={Link} to={`/restaurant/${user.Restaurant_id}`}>
        Click here to go back where you came from!
      </Button>
    </Box> : null
  );
}

export default HomePage;
