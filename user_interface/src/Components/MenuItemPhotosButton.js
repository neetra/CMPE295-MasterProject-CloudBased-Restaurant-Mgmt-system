import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent,
    ImageList,
    ImageListItem,
    IconButton,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { REVIEWSBASEURL } from '../constants.js';

const MenuItemPhotosButton = ({ restaurantId, item }) => {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState([]);

  // Media query to add responsiveness to the image list
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesMd = useMediaQuery(theme.breakpoints.down('md'));
  const cols = matchesSm ? 1 : matchesMd ? 2 : 3;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        // API call to get all photos given the restaurant ID and menu item ID
        const response = await axios.get(`${REVIEWSBASEURL}/reviews/photos/${restaurantId}/${item.Item_id}`);
        setPhotos(response.data.photo_urls);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    if (open) {
      fetchPhotos();
    }
  }, [open, restaurantId, item]);

  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
        View Photos
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
        <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
            <Typography variant="h6">{item.Item_name}</Typography>
            </Grid>
            <Grid item>
            <IconButton
                edge="end"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
                size="large"
            >
                <Typography
                variant="button"
                component="span"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginRight: 1,
                }}
                >
                Close
                </Typography>
                <CloseIcon />
            </IconButton>
            </Grid>
        </Grid>
        </DialogTitle>
        <DialogContent>
            {photos && photos.length > 0 ? (
                <ImageList cols={cols} gap={8}>
                    {photos.map((photo, index) => (
                    <ImageListItem key={index}>
                        {/* Lazy loading to load images only when needed */}
                        <img src={photo} alt={`Item ${item.Item_id} - ${index + 1}`} loading="lazy" />
                    </ImageListItem>
                    ))}
                </ImageList>
            ) : (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="200px"
                >
                    <Typography variant="h6" color="text.secondary">
                    No Photos Yet!
                    </Typography>
                </Box>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuItemPhotosButton;