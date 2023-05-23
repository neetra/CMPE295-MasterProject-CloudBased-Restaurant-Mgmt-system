import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { styled } from '@mui/system';

import { pingRedis } from '../Services/PingRedis'
import { updateMenuItem } from '../Redux/menuSlice.js';
import { MENUBASEURL } from '../constants.js';

const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

function EditMenuItemButton({ item, restaurantId }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [itemData, setItemData] = useState({ ...item });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const isNewCategory = newCategory && !categories.find((cat) => cat.Category_description === newCategory);

  useEffect(() => {
    const fetchCategories = async () => {
      // API call to retrieve all menu item categories
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

  const handleUpdateMenuItem = async () => {
    try {
      // API call to update an existing menu item
      const response = await axios.put(`${MENUBASEURL}/item?itemId=${item.Item_id}&restaurantId=${restaurantId}`, itemData);
      
      // NOTE: dispatching only response.data will result in the redux state not updating as it will be an object, so make sure to do response.data[0]
      if (response.status === 200) {
        dispatch(updateMenuItem(response.data[0]));
        setAlertSeverity('success');
        setAlertMessage('Item updated successfully!');

        pingRedis()
      }
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage('Item update failed.');
      console.error('Error updating item:', error);
    }
    setSnackbarOpen(true);

    // Close the dialog
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      return;
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      // API call to upload a new image for an existing menu item
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

  const handleAddCategory = async () => {
    try {
      // API call to add a new menu item category
      const response = await axios.post(`${MENUBASEURL}/category`);

      if (response.status === 200) {
        // Update the categories list and set the new category ID for the item
        setCategories([
          ...categories,
          { Category_description: newCategory, Category_id: response.data },
        ]);
        console.log("categories", categories)
        setItemData({ ...itemData, Item_category_id: response.data.Category_id });
        console.log("itemData", itemData)
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

  // Changing the category is optional when updating item
  const areFieldsValid = () => {
    const {
      Item_name,
      Item_description,
      Item_price,
      Item_image_link,
    } = itemData;

    return (
      Item_name &&
      Item_description &&
      parseFloat(Item_price) > 0 &&
      Item_image_link
    );
  };

  return (
    <>
      <StyledButton variant="contained" color="primary" onClick={() => setOpen(true)}>
        Update Menu Item
      </StyledButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Menu Item</DialogTitle>
        <StyledDialogContent>
          <StyledTextField name="Item_restaurant_id" label="Item Restaurant ID" value={restaurantId} disabled fullWidth />
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
          <div>
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="item-stock-quantity"
                name="Item_Stock_Quantity"
                value={itemData.Item_Stock_Quantity.toString()}
                onChange={handleInputChange}
              >
                <FormControlLabel value="1" control={<Radio />} label="In Stock" />
                <FormControlLabel value="0" control={<Radio />} label="Out of Stock" />
              </RadioGroup>
            </FormControl>
          </div>
        </StyledDialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleUpdateMenuItem} disabled={!areFieldsValid()}>
            Update Menu Item
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

export default EditMenuItemButton;