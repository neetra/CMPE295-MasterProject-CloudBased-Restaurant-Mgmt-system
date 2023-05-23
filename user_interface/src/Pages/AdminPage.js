import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Button, 
  Stack, 
  Box,
  Tab,
  Tabs,
  Divider
} from '@mui/material';

import { logout } from '../Redux/authReducer.js';
import Register from '../Components/Register.js';
import AdminRestaurantTable from '../Components/AdminRestaurantTable.js';
import AdminCreateRestaurant from '../Components/AdminCreateRestaurant.js';
import ManageUsers from '../Components/ManageUsers.js';
import '../Styles/AdminManagerPage.css';

const AdminPage = () => {
  const user = JSON.parse(localStorage.getItem('profile'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
      <h1>Admin Login</h1>
      <Stack spacing={2} direction="row">
        <Button variant="contained" component={Link} to={`/adminlogin`}>
          Admin Login
        </Button>
      </Stack>
    </Box>
    
    : user.Role_id !== 2 ?

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
      <Button variant="contained" component={Link} to={`/restaurant/${user.Restaurant_id}`}>
        Click here to go back where you came from!
      </Button>
    </Box>

    : user.Role_id === 2 ?

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
        <h1>Admin Dashboard</h1>
        <Button variant="contained" color="error" onClick={() => {dispatch(logout()); navigate(`/admin`);}} sx={{marginBottom: '30px'}}>
          Logout
        </Button>
        <Divider />
      </Box>
      <br></br>
      <Box>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable" scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': {
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          }}
        >
          <Tab label="View All Restaurants" />
          <Tab label="Create New Restaurant" />
          <Tab label="Register New Admin" />
          <Tab label="View All Admins" />
        </Tabs>
      </Box>
      <Box sx={{ width: '80%', marginTop: '20px' }}>
        <Divider />
      </Box>
      <Box className="content-container">
        {activeTab === 0 && <AdminRestaurantTable />}
        {activeTab === 1 && <AdminCreateRestaurant />}
        {activeTab === 2 && <Register role={2} />}
        {activeTab === 3 && <ManageUsers role={2} />}
      </Box>
    </Box> : null
  );
};

export default AdminPage;