import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    TablePagination,
    TextField,
    IconButton, 
    InputAdornment,
    Box
} from '@mui/material';
import { Clear } from '@mui/icons-material';

import '../Styles/AdminRestaurantTable.css'
import { MENUBASEURL } from '../constants.js';

const AdminRestaurantTable = () => {
    const user = JSON.parse(localStorage.getItem('profile'));

    const [restaurants, setRestaurants] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const filteredRestaurants = restaurants.filter((restaurant) => {
        return restaurant.Restaurant_name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    useEffect(() => {
    if (user && user.Role_id === 2) {
            // API call to retrieve all restaurants
            axios.get(`${MENUBASEURL}/restaurants`)
                .then((response) => setRestaurants(response.data));
        }
    }, [user]);

    return (
        <>
            <Box className="view-restaurant-container">
                <TextField
                    label="Search Restaurants"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <IconButton color="primary" onClick={handleClearSearch} aria-label="clear search" edge="end">
                                <Clear />
                            </IconButton>
                        </InputAdornment>
                        ),
                    }}
                    sx={{ marginBottom: 2, marginTop: 5, width: '75%' }}
                />
            </Box>
            <Box className="view-restaurant-container">
                <TableContainer component={Paper} sx={{ width: '75%' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="restaurant table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Restaurant ID</TableCell>
                                <TableCell>Restaurant Name</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRestaurants.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((restaurant) => (
                                <TableRow key={restaurant.Restaurant_id}>
                                <TableCell sx={{ width: '20%' }}>{restaurant.Restaurant_id}</TableCell>
                                <TableCell>
                                    <Link to={`/restaurant/${restaurant.Restaurant_id}`}>
                                    {restaurant.Restaurant_name}
                                    </Link>
                                </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <Box className="view-restaurant-container">
                <TablePagination
                    component="div"
                    count={filteredRestaurants.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ width: '75%' }}
                />
            </Box>
        </>
    );
};

export default AdminRestaurantTable;