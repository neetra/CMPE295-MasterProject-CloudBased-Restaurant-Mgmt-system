import React, { useState } from 'react';
import { 
  Tab, 
  Tabs, 
  TextField, 
  IconButton, 
  InputAdornment,
  Box,
  Divider
} from '@mui/material';
import { Clear } from '@mui/icons-material';

import MenuItem from './MenuItem.js';
import '../Styles/MenuTabs.css';
import '../Cart.css';

const MenuTabs = ({ items, reviews, onDeleteItem, setSnackbarOpen, setAlertSeverity, setAlertMessage }) => {
  const user = JSON.parse(localStorage.getItem('profile'));
  const [selectedTab, setSelectedTab] = useState(0);
  const categories = [...new Set(items.map((item) => item.Category_description))];
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Allow searching for a specific menu item in a given category
  const filteredItems = items.filter((item) => {
    const searchTermLowerCase = searchTerm.toLowerCase();
    return (
      item.Category_description === categories[selectedTab] &&
      (item.Item_id.toLowerCase().includes(searchTermLowerCase) ||
        item.Item_name.toLowerCase().includes(searchTermLowerCase))
    );
  });

  return (
      <div>
        <div className="tabs-container">
          <Tabs 
            value={selectedTab} 
            onChange={handleChange} 
            variant="scrollable" 
            scrollButtons="auto"
            // Underline each selection when hovering
            sx={{ 
              '& .MuiTab-root': {
                '&:hover': {
                  textDecoration: 'underline',
                },
              },
            }}
          >
            {categories.map((category, index) => (
              <Tab key={index} label={category} />
            ))}
          </Tabs>
        </div>
        <Divider />
        <Box className="search-container">
          <TextField
            label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            fullWidth
            InputProps={{
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={handleClearSearch} aria-label="clear search" edge="end">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <div className="menu-container">
          {filteredItems.map((item) => (
            <MenuItem 
              key={item.Item_id} 
              item={item} 
              onDeleteItem={onDeleteItem}
              setSnackbarOpen={setSnackbarOpen}
              setAlertSeverity={setAlertSeverity}
              setAlertMessage={setAlertMessage}
              reviews={user === null || user.Role_id === 1 ? reviews[item.Item_id] : undefined} />
          ))}
        </div>
      </div>
  );
};

export default MenuTabs;