import React, { useState, useEffect } from 'react';
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
    Box,
    Button,
    Alert,
    Snackbar
} from '@mui/material';
import { Clear } from '@mui/icons-material';

import '../Styles/ManageUsers.css'
import { USERBASEURL } from '../constants.js';

const ManageUsers = ({ role, rest_id }) => {
    const currentUser = JSON.parse(localStorage.getItem('profile'));

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [alertMessage, setAlertMessage] = useState('');
    const [users, setUsers] = useState([]);
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

    const handleStatusUpdate = async (userId, currentStatusId) => {
        const newStatusId = currentStatusId === 1 ? 2 : 1;
        try {
            // API call to set a user as active or inactive
            const response = await axios.put(`${USERBASEURL}/user/status`, { UserId: userId, StatusId: newStatusId });
    
            if (response.status === 200) {
                setAlertSeverity('success');
                setAlertMessage('User status updated successfully!');
    
                // Update the users list after changing the status
                setUsers(users.map(user => {
                    if (user.User_id === userId) {
                        return { ...user, Status_id: newStatusId, Status_name: newStatusId === 1 ? 'Active' : 'Inactive' };
                    }
                    return user;
                }));
            }
        } catch (error) {
            console.error("Error updating user status:", error);
            setAlertSeverity('error');
            setAlertMessage('Failed to update user status.');
        }
        setSnackbarOpen(true);
    };

    // Filters the users to display depending on the current logged in user's role ID and/or restaurant ID
    // Also filters out current user to avoid deactivating current user
    const filteredUsers = users
    .filter((user) => {
        const matchesRole = !role || user.Role_id === role;
        const matchesRestaurant = !rest_id || user.Restaurant_id === rest_id;
        const matchesSearch = user.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.First_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.Last_name.toLowerCase().includes(searchTerm.toLowerCase());
        const isNotCurrentUser = currentUser.User_id !== user.User_id;

        return matchesRole && matchesRestaurant && matchesSearch && isNotCurrentUser;
    })
    .sort((a, b) => {
        // Sorts the active users first, then inactive users
        return a.Status_id === b.Status_id ? 0 : a.Status_id === 1 ? -1 : 1;
    });
    
    useEffect(() => {
        axios.get(`${USERBASEURL}/users`)
            .then((response) => setUsers(response.data));
    }, []);

    return (
        <>
            <Box className="view-users-container">
                <TextField
                    label="Search Users"
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
            <Box className="view-users-container">
                <TableContainer component={Paper} sx={{ width: '75%' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="user table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: '20%' }}>User ID</TableCell>
                                <TableCell sx={{ width: '25%' }}>Email</TableCell>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell sx={{ width: '10%' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                                <TableRow key={user.User_id}>
                                    <TableCell>{user.User_id}</TableCell>
                                    <TableCell>{user.Email}</TableCell>
                                    <TableCell>{user.First_name}</TableCell>
                                    <TableCell>{user.Last_name}</TableCell>
                                    <TableCell
                                        sx={{
                                            backgroundColor: user.Status_id === 1 ? "#ABEBC6" : "#F5B7B1",
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {user.Status_name}
                                    </TableCell>
                                    <TableCell sx={{ width: '15%' }}>
                                        <Button
                                            variant="outlined"
                                            color={user.Status_id === 1 ? "error" : "primary"}
                                            onClick={() => handleStatusUpdate(user.User_id, user.Status_id)}
                                        >
                                            {user.Status_id === 1 ? "Deactivate" : "Activate"}
                                        </Button>
                                    </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            </Box>
            <Box className="view-users-container">
                <TablePagination
                    className="view-users-pagination"
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
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
};

export default ManageUsers;