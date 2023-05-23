import React, { useState } from 'react';
import axios from 'axios';
import {
    TextField,
    Button,
    Box,
    Snackbar,
    Alert,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Link
} from '@mui/material';
import { styled } from '@mui/system';

import { MENUBASEURL, REVIEWSBASEURL } from '../constants.js';

const StyledLink = styled(Link)(({ theme }) => ({
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '1rem',
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
}));

const AdminCreateRestaurant = () => {
    const [isError, setIsError] = useState(false);
    const [restaurantName, setRestaurantName] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [alertMessage, setAlertMessage] = useState(null);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [newRestaurant, setNewRestaurant] = useState('');
    const [newRestaurantId, setNewRestaurantId] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [restaurantImageUrl, setRestaurantImageUrl] = useState(null);

    const API = axios.create({ baseURL: MENUBASEURL })

    API.interceptors.request.use((req) => {
        if (localStorage.getItem('profile')) {
            req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`
        }
    
        return req;
    });  

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'JWT'
    }

    const handleImageUpload = async () => {
        if (!imageFile) {
            return;
        }

        const formData = new FormData();
        formData.append('photo', imageFile);

        try {
            // API call to upload photo (since Lambda is used, max payload size is 6 MB)
            const res = await axios.post(`${REVIEWSBASEURL}/upload-photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 200) {
                console.log(res.data.photo_url)
                setRestaurantImageUrl(res.data.photo_url);
                setAlertSeverity('success');
                setAlertMessage('Image uploaded successfully!');
            }
        } catch (error) {
            console.error(error);
            setAlertSeverity('error');
            // Limit the image size to 4 MB to ensure payload size does not exceed 6 MB
            setAlertMessage('Error uploading image or image size exceeds 4 MB.');
        }
        setSnackbarOpen(true);
    };

    const handleFileChange = (event) => {
        setImageFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const restaurantData = {
            Restaurant_name: restaurantName,
            Restaurant_image_url: restaurantImageUrl,
        }
        
        // API call to create a new restaurant
        const response = await API.post('/restaurant', JSON.stringify(restaurantData), {
            headers: headers
        }).then((response) => response).catch((error) => console.log(error));

        if (response && response.status === 200) {
            setAlertSeverity('success');
            setAlertMessage('Restaurant Created Successfully!');
            setIsError(false);
            setNewRestaurant(restaurantName);
            setNewRestaurantId(response.data.Restaurant_id);
            setRestaurantName('');
            setRestaurantImageUrl(null);
        } else {
            setAlertSeverity('error');
            setAlertMessage('Error Creating Restaurant.');
            setIsError(true);
            setNewRestaurant('');
            setNewRestaurantId('');
        }
        setSnackbarOpen(true);
        setConfirmationOpen(false);
    }

    const handleConfirmationOpen = () => {
        if (restaurantName.trim() !== '' && restaurantImageUrl !== null) {
            setIsError(false);
            setConfirmationOpen(true);
        } else {
            setAlertSeverity('error');
            setAlertMessage('Missing information or an error occurred!');
            setIsError(true);
            setSnackbarOpen(true);
        }
    };  

    const handleConfirmationClose = () => {
        setConfirmationOpen(false);
    };

    return (
        <Box
            sx={{
            marginTop: 4,
            display: "flex",
            justifyContent: "center",
            width: "100%",
            }}
        >
            <Box
            component="form"
            onSubmit={(event) => event.preventDefault()}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    padding: 2,
                    borderRadius: 3,
                    boxShadow: 3,
                    width: "60%",
                }}
            >
            <Typography variant="h5" component="u">
                Create New Restaurant
            </Typography>
            <TextField
                required
                label="Restaurant Name"
                type="text"
                value={restaurantName}
                onChange={(event) => setRestaurantName(event.target.value)}
                sx={{ width: "80%" }}
            />
            <TextField
                required
                label="Restaurant Image URL"
                type="text"
                value={restaurantImageUrl || ''}
                disabled
                sx={{ width: "80%" }}
            />
            <Box sx={{ width: "80%", display: "flex", justifyItems: "left" }}>
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
            </Box>
            {imageFile && <Typography variant="body2" style={{ marginTop: '0.1rem', width: "80%", display: "flex", justifyItems: "left" }}>{imageFile.name}</Typography>}
            <Button variant="contained" onClick={handleConfirmationOpen}>
                Create 
            </Button>
            {isError ? (
                <Typography variant="body1" color="error">
                    Missing information or an error occurred, please try again!
                </Typography>
            ) : null}
            {newRestaurant && newRestaurantId ? (
                <>
                    <Typography variant="body1" color="#4BB543">
                        Restaurant Successfully Created!
                    </Typography>
                    <StyledLink
                        component="a"
                        href={`/restaurant/${newRestaurantId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Click here to visit {newRestaurant}
                    </StyledLink>
                </>
            ) : null}

            </Box>

            <Dialog open={confirmationOpen} onClose={handleConfirmationClose}>
                <DialogTitle>
                    <u>Confirm Restaurant Creation</u>
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to create the restaurant <b>"{restaurantName}"</b>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmationClose} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen && !!alertMessage}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={alertSeverity}
                    sx={{ width: "100%" }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminCreateRestaurant;