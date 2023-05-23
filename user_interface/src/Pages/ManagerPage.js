import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Button, 
  Stack, 
  Box,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import { setRestaurantId, setRestaurantName } from '../Redux/restaurantSlice.js';
import { logout } from '../Redux/authReducer.js';
import Register from '../Components/Register.js';
import ManageUsers from '../Components/ManageUsers.js';
import { MENUBASEURL } from '../constants.js';
import '../Styles/AdminManagerPage.css';

const ManagerPage = () => {
  const user = JSON.parse(localStorage.getItem('profile'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storedRestaurantId = useSelector((state) => state.restaurant.id);
  const { id: urlRestaurantId } = useParams();
  const restaurantId = storedRestaurantId || urlRestaurantId;
  const restaurantName = useSelector((state) => state.restaurant.name);

  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchRestaurantName = async (restaurantId) => {
      try {
        const response = await axios.get(`${MENUBASEURL}/restaurants`);
        const restaurant = response.data.find((restaurant) => restaurant.Restaurant_id === restaurantId);
    
        if (restaurant) {
          dispatch(setRestaurantName(restaurant.Restaurant_name));
          dispatch(setRestaurantId(restaurant.Restaurant_id));
        } else {
          console.error(`Restaurant with ID ${restaurantId} not found.`);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant name:', error);
      }
    };

    fetchRestaurantName(restaurantId);
  }, [dispatch, restaurantId]);

  return (
    user === null ?

    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>Manager Login</h1>
      <Stack spacing={2} direction="row">
        <Button variant="contained" component={Link} to={`/login`}>
        Manager Login
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
      <h1>You do not have permisson to view this resource!</h1>
      <Button variant="contained" component={Link} to={`/restaurant/${storedRestaurantId}`}>
        Click here to go back where you came from!
      </Button>
    </Box>

    : (user.Role_id === 3 && user.Restaurant_id !== restaurantId) ?

    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1>You do not have permisson to view this resource!</h1>
      <Button variant="contained" component={Link} to={`/restaurant/${user.Restaurant_id}/manager`}>
        Click here to go back where you came from!
      </Button>
    </Box>

    : user.Role_id === 2 || (user.Role_id === 3 && user.Restaurant_id === restaurantId) ?

    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'top',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '80%' }}>
        <h1>Manager Dashboard ({restaurantName})</h1>
        <Button variant="outlined" onClick={() => {navigate(`/restaurant/${restaurantId}`);}} sx={{marginBottom: '30px'}}>
          <HomeIcon />
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            dispatch(logout());
            if (user.Role_id === 2) {
              navigate('/adminlogin');
            } else if (user.Role_id === 3) {
              navigate('/login');
            }
          }}
          sx={{ marginLeft: '24px', marginBottom: '30px'}}
        >
          Logout
        </Button>
        <Divider />
      </Box>
      <br></br>
      <Box>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': {
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          }}
        >
          <Tab label="Register New Manager" />
          <Tab label="View All Managers" />
        </Tabs>
      </Box>
      <Box sx={{ width: '80%', marginTop: '20px' }}>
        <Divider />
      </Box>
      <Box className="content-container">
        {activeTab === 0 && <Register role={3} rest_id={restaurantId} />}
        {activeTab === 1 && <ManageUsers role={3} rest_id={restaurantId} />}
      </Box>
    </Box> : null
  );
};

export default ManagerPage;