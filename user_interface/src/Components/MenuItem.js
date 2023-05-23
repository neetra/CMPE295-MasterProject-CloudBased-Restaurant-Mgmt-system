import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Rating,
  Chip,
  TextField,
  Typography,
} from '@mui/material';

import { addToCart } from '../Redux/menuSlice.js';
import EditMenuItemButton from './EditMenuItemButton.js';
import MenuItemPhotosButton from './MenuItemPhotosButton.js';
import SubmitReviewButton from './SubmitReviewButton.js';
import '../Styles/MenuItem.css'
import { MENUBASEURL, REVIEWSBASEURL } from '../constants.js';

const MenuItem = ({ item, reviews, onDeleteItem, setSnackbarOpen, setAlertSeverity, setAlertMessage }) => {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const storedRestaurantId = useSelector((state) => state.restaurant.id);
  const { id: urlRestaurantId } = useParams();
  const restaurantId = storedRestaurantId || urlRestaurantId;
  const user = JSON.parse(localStorage.getItem('profile'));

  // State to handle open/close state of delete confirmation dialog
  const [open, setOpen] = useState(false);

  // Functions to open/close delete confirmation dialog
  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  const handleAddToCart = () => {
    dispatch(addToCart({ item, quantity }));
  };

  const handleQuantityChange = (event) => {
    setQuantity(parseInt(event.target.value, 10));
  };

  const handleDeleteItem = async () => {
    handleClose();
    try {
      // API call to delete an existing menu item and associated review data
      const delete_item_res = await axios.delete(`${MENUBASEURL}/item?itemId=${item.Item_id}`);
      const delete_review_res = await axios.delete(`${REVIEWSBASEURL}/reviews/delete/${restaurantId}/${item.Item_id}`);
      if (delete_item_res.status === 200 && delete_review_res.status === 204) {
        onDeleteItem(item.Item_id, () => {
          setAlertSeverity('success');
          setAlertMessage('Menu Item deleted successfully!');
          setSnackbarOpen(true);
        });
      }
    } catch (error) {
      onDeleteItem(item.Item_id, null, () => {
        console.error('Error deleting item:', error);
        setAlertSeverity('error');
        setAlertMessage('Failed to delete menu item.');
        setSnackbarOpen(true);
      });
    }
      //   onDeleteItem(item.Item_id);

    //   if (delete_item_res.status === 200 && delete_review_res.status === 204) {
    //     setAlertSeverity('success');
    //     setAlertMessage('Menu Item deleted successfully!');
    //   }
    // } catch (error) {
    //   console.error('Error deleting item:', error);
    //   setAlertSeverity('error');
    //   setAlertMessage('Failed to delete menu item.');
    // }
    // setSnackbarOpen(true);
  };

  return (

    user === null || user.Role_id === 1 ? (

      <div className="menu-item">
        <img src={item.Item_image_link} alt={item.Item_name} />
        <h3>{item.Item_name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <Typography title={reviews ? `Average rating: ${reviews.average_rating}` : 'No rating yet'}>
            <Rating
              name={`rating-${item.Item_id}`}
              value={reviews ? reviews.average_rating : 0}
              precision={0.1}
              readOnly
            />
          </Typography>
          <span style={{ marginLeft: '8px', marginBottom: '8px' }}>
            ({reviews ? reviews.total_reviews : 0}{' '}
            {reviews && reviews.total_reviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>
        <MenuItemPhotosButton restaurantId={restaurantId} item={item} />
        <hr></hr>
        {reviews && reviews.summary && reviews.summary !== "{}" && (
          <div>
            {JSON.parse(reviews.summary).positive &&
              JSON.parse(reviews.summary).positive.map((value, index) => (
                <Chip
                  key={index}
                  label={value}
                  style={{ backgroundColor: '#ABEBC6', color: 'black', margin: '3px' }}
                />
              ))}
            {JSON.parse(reviews.summary).negative &&
              JSON.parse(reviews.summary).negative.map((value, index) => (
                <Chip
                  key={index}
                  label={value}
                  style={{ backgroundColor: '#F5B7B1', color: 'black', margin: '3px' }}
                />
              ))}
          </div>
        )}
        <hr></hr>
        <p>{item.Item_description}</p>
        <p>${item.Item_price}</p>
        <div className="menu-item-actions">
          {item.Item_Stock_Quantity > 0 && (
            <TextField
              type="number"
              label="Quantity"
              variant="outlined"
              size="small"
              value={quantity}
              onChange={handleQuantityChange}
              InputProps={{
                inputProps: {
                  min: 1,
                  max: 99,
                },
              }}
            />
          )}
          <Button
            variant="outlined"
            onClick={handleAddToCart}
            disabled={item.Item_Stock_Quantity === 0}
          >
            {item.Item_Stock_Quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
        <SubmitReviewButton restaurantId={restaurantId} item={item} />
      </div>

    ) : (user.Role_id === 2 || user.Role_id === 3) ? (

      <div className="menu-item">
        <img src={item.Item_image_link} alt={item.Item_name} />
        <h3>{item.Item_name}</h3>
        <p>{item.Item_description}</p>
        <p>Category: {item.Category_description} <br></br>(Category ID: {item.Item_Category_id})</p>
        <p>Item ID: {item.Item_id}</p>
        <p>${item.Item_price}</p>
        <EditMenuItemButton item={item} restaurantId={restaurantId} />
        <Button variant="contained" color="error" onClick={handleClickOpen}>Delete Item</Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle><u>Delete Item</u></DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete <b>{item.Item_name}</b>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={handleClose}>
              Keep Item
            </Button>
            <Button variant="outlined" onClick={handleDeleteItem} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div> 
    ) : null
  );
};

export default MenuItem;
