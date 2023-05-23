import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { 
  Button, 
  Box,
  Typography,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

import AddMenuItemButton from '../Components/AddMenuItemButton.js';
import { setRestaurantId, setRestaurantName, setRestaurantImage } from '../Redux/restaurantSlice.js';
import { setMenuItems, setReviews } from '../Redux/menuSlice.js';
import MenuTabs from '../Components/MenuTabs.js';
import Cart from '../Cart.js';
import '../Styles/MenuInventory.css';
import { login } from '../Redux/authReducer.js';
import { MENUBASEURL, REVIEWSBASEURL } from '../constants.js';
import ChatBot from '../Components/ChatBot.js';

function MenuInventory() {
  const dispatch = useDispatch();
  const menuItems = useSelector((state) => state.menu.menuItems);
  const reviews = useSelector((state) => state.menu.reviews);
  // const storedRestaurantId = useSelector((state) => state.restaurant.id);
  // // const { id: urlRestaurantId } = useParams();
  // // const restaurantId = storedRestaurantId || urlRestaurantId;
  const { id: restaurantId } = useParams();
  const restaurantName = useSelector((state) => state.restaurant.name);
  const restaurantImageURL = useSelector((state) => state.restaurant.imageURL);
  const [user, setUser] = useState(
    localStorage.getItem('profile') && JSON.parse(localStorage.getItem('profile')).length !== 0
      ? JSON.parse(localStorage.getItem('profile'))
      : null
  );

  // Displays success / failure message
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  const handleDeleteItem = useCallback((itemId, successCallback, errorCallback) => {
    try {
      dispatch(setMenuItems(menuItems.filter((item) => item.Item_id !== itemId)));
      if (successCallback) {
        successCallback();
      }
    } catch (error) {
      if (errorCallback) {
        errorCallback();
      }
    }
  }, [dispatch, menuItems]);

  // Wrap the fetchMenuItems function in a useCallback hook to prevent unneeded re-rendering
  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await axios.get(`${MENUBASEURL}/items?restaurantId=${restaurantId}`);
      dispatch(setMenuItems(response.data));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [dispatch, restaurantId]);

  useEffect(() => {
    console.log("AddEventlister")
    var curl = MENUBASEURL + "/stream3"
    var source = new EventSource(curl);
        source.addEventListener('greeting', function(event) {
            var data = JSON.parse(event.data);
            console.log("The server says " + data.message);

            fetchMenuItems()
        
        }, false);
  },[fetchMenuItems])
  
  useEffect(() => {
    const fetchRestaurantName = async (restaurantId) => {
      try {
        const response = await axios.get(`${MENUBASEURL}/restaurants`);
        const restaurant = response.data.find((restaurant) => restaurant.Restaurant_id === restaurantId);
    
        if (restaurant) {
          dispatch(setRestaurantName(restaurant.Restaurant_name));
          dispatch(setRestaurantId(restaurantId));
          dispatch(setRestaurantImage(restaurant.Restaurant_image_url));
        } else {
          console.error(`Restaurant with ID ${restaurantId} not found.`);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant name:', error);
      }
    };

    const fetchMenuItemReviews = async () => {
      try {
        // API call to get all the menu item review data for a specified restaurant ID
        const response = await axios.get(`${REVIEWSBASEURL}/reviews/menu_item_details/${restaurantId}`);
        // Use reduce function to easily access reviews data by each menu item's ID
        const reviews = response.data.reduce((accumulator, review) => {
          accumulator[review.menu_item_id] = {
            average_rating: review.average_rating,
            summary: review.summary,
            total_reviews: review.total_reviews,
          };
          return accumulator;
        }, {});
    
        dispatch(setReviews(reviews));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    // Set the user in the Redux state if it exists
    if(user !== null && Object.keys(user).length !== 0) {
      dispatch(login(user))
      setUser(user)
    }

    fetchRestaurantName(restaurantId);
    fetchMenuItems();
    fetchMenuItemReviews();
  }, [dispatch, restaurantId, user, fetchMenuItems]);

  return (

    user === null || user.Role_id === 1 ?
    
    <div className="MenuInventory">
      <Box className="my-header">
        <Button variant="outlined" component={Link} to={`/restaurant/${restaurantId}`}>
          <HomeIcon />
        </Button>
        <Typography variant="h4" className="restaurantName">
          {restaurantName}
        </Typography>
      </Box>

      <Divider />
      {restaurantImageURL && (
        <Box className="my-header-img" sx={{ backgroundImage: `url(${restaurantImageURL})` }}>
          <Divider />
        </Box>
      )}
      <MenuTabs items={menuItems} reviews={reviews} />
      <Cart />
      <ChatBot restaurantName={restaurantName} />
    </div>

    : user.Role_id === 2 || (user.Role_id === 3 && user.Restaurant_id === restaurantId) ?

    <div className="MenuInventory">
      <Box className="restaurant-name-container">
        <Typography variant="h4" className="restaurantName">
          Manage {restaurantName} Menu
        </Typography>
      </Box>
      <Box className="home-add-menu-item-button-container">
        <Button variant="outlined" component={Link} to={`/restaurant/${restaurantId}`}>
          <HomeIcon />
        </Button>
        <AddMenuItemButton restaurantId={restaurantId} />
      </Box>
      <Divider />
      <MenuTabs 
        items={menuItems} 
        onDeleteItem={handleDeleteItem}
        setSnackbarOpen={setSnackbarOpen}
        setAlertSeverity={setAlertSeverity}
        setAlertMessage={setAlertMessage}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>

  : (user.Role_id === 3 && user.Restaurant_id !== restaurantId) ?

  <Box>
    <Typography variant='h4' sx={{ margin: '100px' }}>You do not have permission to view this resource!</Typography>
    <Button variant="contained" component={Link} to={`/restaurant/${user.Restaurant_id}/menu`}>
      Click here to go back where you came from!
    </Button>
  </Box> : null
  );
}

export default MenuInventory;