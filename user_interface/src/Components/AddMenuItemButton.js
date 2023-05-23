import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/system';

import { pingRedis } from '../Services/PingRedis.js';
import { useDispatch } from 'react-redux';
import { addToMenuItems } from '../Redux/menuSlice.js';
import { MENUBASEURL } from '../constants.js';

// Styles for several Material UI components
const StyledButton = styled(Button)(({ theme }) => ({
    marginBottom: theme.spacing(2),
  }));
  
  const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    paddingTop: theme.spacing(2),
  }));
  
  const StyledTextField = styled(TextField)(({ theme }) => ({
    marginTop: theme.spacing(2),
  }));

function AddMenuItemButton({ restaurantId }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [itemData, setItemData] = useState({
    Item_name: '',
    Item_description: '',
    Item_price: '',
    Item_image_link: '',
    Item_category_id: '',
    Item_restaurant_id: restaurantId,
  });

  // Displays success / failure message
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');

  // Disables Add New Category button when the category already exists in the list
  const isNewCategory = newCategory && !categories.find((cat) => cat.Category_description === newCategory);

  // Used for item image
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await axios.get(`${MENUBASEURL}/categories`)
      setCategories(response.data);
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (event, value) => {
    if (value && value.Category_id) {
      setItemData({ ...itemData, Item_category_id: value.Category_id });
      setNewCategory('');
    } else {
      setNewCategory(value);
      setItemData({ ...itemData, Item_category_id: '' });
    }
  };

  // API call to handle the addition of a new menu item category
  const handleAddCategory = async () => {
    try {
      const response = await axios.post(`${MENUBASEURL}/category`);

      if (response.status === 200) {
        // Update the categories list and set the new category ID for the item
        setCategories([
          ...categories,
          { Category_description: newCategory, Category_id: response.data },
        ]);
        setItemData({ ...itemData, Item_category_id: response.data.Category_id });
        setNewCategory('');
        setAlertSeverity('success');
        setAlertMessage('Category added successfully!');
      }
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage('Failed to add category.');
    }
    setSnackbarOpen(true);
  };

  // API call to handle the addition of a new menu item
  const handleAddMenuItem = async () => {
    try {
      const response = await axios.post(`${MENUBASEURL}/item`, itemData);

      if (response.status === 200) {
        // Add the new menu item to the Redux state so we do not have to reload the page
        dispatch(addToMenuItems(response.data));
        pingRedis()
        setAlertSeverity('success');
        setAlertMessage('Menu item added successfully!');
      }
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage('Error adding new menu item.');
    }

    // Show the Snackbar
    setSnackbarOpen(true);

    // Close the dialog and reset the form
    setOpen(false);
    setImageFile(null);
    setItemData({
      Item_name: '',
      Item_description: '',
      Item_price: '',
      Item_image_link: '',
      Item_category_id: '',
      Item_restaurant_id: restaurantId,
    });
  };

  // Handles item image upload
  const handleImageUpload = async () => {
    if (!imageFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', imageFile);
    
    // API call to upload a image for a menu item
    try {
      const response = await axios.post(`${MENUBASEURL}/uploadImage`, formData);

      if (response.status === 200) {
        setItemData({ ...itemData, Item_image_link: response.data.imageLink });
        setAlertSeverity('success');
        setAlertMessage('Image uploaded successfully!');
      }
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage('Error uploading image.');
      console.error('Error uploading image:', error.response.data);
    }
    setSnackbarOpen(true);
  };

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  // Clears form whenver it closes without submitting
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setImageFile(null);
    setItemData({
      Item_name: '',
      Item_description: '',
      Item_price: '',
      Item_image_link: '',
      Item_category_id: '',
      Item_restaurant_id: restaurantId,
    });
  };

  // Checks if all text fields are valid
  const areFieldsValid = () => {
    const {
      Item_name,
      Item_description,
      Item_price,
      Item_image_link,
      Item_category_id,
    } = itemData;

    return (
      Item_name &&
      Item_description &&
      parseFloat(Item_price) > 0 &&
      Item_image_link &&
      Item_category_id
    );
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add New Menu Item
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Menu Item</DialogTitle>
        <StyledDialogContent>
          <StyledTextField name="Item_restaurant_id" label="Item Restaurant ID" value={itemData.Item_restaurant_id} disabled fullWidth />
          <StyledTextField name="Item_name" label="Item Name" value={itemData.Item_name} onChange={handleInputChange} fullWidth />
          <StyledTextField name="Item_description" label="Item Description" value={itemData.Item_description} onChange={handleInputChange} fullWidth />
          <StyledTextField name="Item_price" label="Item Price" type="number" step="0.01" value={itemData.Item_price} onChange={handleInputChange} fullWidth />
          <StyledTextField name="Item_image_link" label="Item Image Link" value={itemData.Item_image_link} disabled onChange={handleInputChange} fullWidth />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="image-upload">
            <Button variant="outlined" color="primary" component="span">
              Choose Image
            </Button>
          </label>
          <Button variant="contained" color="primary" onClick={handleImageUpload} disabled={!imageFile}>
            Upload
          </Button>
          <Autocomplete
            renderInput={(params) => <StyledTextField {...params} label="Item Category" />}
            value={categories.find((cat) => cat.Category_id === itemData.Item_category_id) || null}
            onInputChange={(event, value) => handleCategoryChange(event, value)}
            onChange={(event, value) => handleCategoryChange(event, value)}
            freeSolo
            options={categories}
            getOptionLabel={(option) => option.Category_description}
          />
          {newCategory && (
            <StyledButton variant="outlined" color="primary" onClick={handleAddCategory} disabled={!isNewCategory}>
              Add New Category
            </StyledButton>
          )}
        </StyledDialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddMenuItem} disabled={!areFieldsValid()}>
            Add New Menu Item
          </Button>
        </DialogActions>
      </Dialog>
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
    </>
  );
}

export default AddMenuItemButton;