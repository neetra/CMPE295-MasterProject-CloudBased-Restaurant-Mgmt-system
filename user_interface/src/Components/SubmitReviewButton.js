import React, { useState } from 'react';
import axios from 'axios';
import { 
    Button, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    TextField, 
    CircularProgress, 
    Rating,
    IconButton,
    Box,
    Grid,
    InputLabel,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';

import { REVIEWSBASEURL } from '../constants.js';

const SubmitReviewButton = ({ restaurantId, item }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingError, setRatingError] = useState(false);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const maxCharCount = 50;
  const [photo, setPhoto] = useState(null);
  const user = JSON.parse(localStorage.getItem('profile'));
  const userId = user?.User_id;

  const rating_labels = {
    1: 'Disappointing',
    2: 'Just Okay',
    3: 'Enjoyable',
    4: 'Very Good',
    5: 'Amazing',
  };

  function getRatingLabelText(value) {
    return `${value} Star${value !== 1 ? 's' : ''}, ${rating_labels[value]}`;
  }

  const handleClickOpen = () => {
    setOpen(true);
    setSubmitted(false);
  };

  const handleClose = (submitted = false) => {
    if (submitted || !loading) {
      // Clear the form
      setRating(0);
      setComment('');
      setPhoto(null);
      setRatingError(false);
      setCharacterCount(0);
      setOpen(false);
    }
  };

  const handleFileChange = (event) => {
      setPhoto(event.target.files[0]);
    };

  const handleSubmit = async () => {
      if (!rating || rating === 0) {
          setRatingError(true);
          return;
      }
      setLoading(true);

    // Construct the payload of a review to be send to the API
    const formData = new FormData();
    formData.append('menu_item_id', item.Item_id);
    formData.append('restaurant_id', restaurantId);
    if(userId) formData.append('user_id', user.User_id);
    formData.append('rating', rating);
    formData.append('comment', comment);
    if (photo) formData.append('photo', photo);
    console.log(formData)

    try {
      // API call to submit a review
      const response = await axios.post(`${REVIEWSBASEURL}/reviews/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setSubmitted(true);
        setLoading(false);
        setRating(0);
        setComment('');
        setPhoto(null);
        setTimeout(() => {
          handleClose(true);
        }, 1500); // Close the review dialog automatically after 1.5 seconds
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Review this item
      </Button>
      <Dialog open={open} onClose={(event, reason) => {
        // Prevent the dialog from being closed before review is successfully submitted
        if (!loading && reason !== 'backdropClick') {
          handleClose(false);
        }
      }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
              Submit a Review for {item.Item_name}
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => handleClose(false)} 
                aria-label="close" 
                disabled={loading || submitted}>
                  <CloseIcon />
              </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <Rating
                    name="hover-feedback"
                    value={rating}
                    getLabelText={getRatingLabelText}
                    onChange={(event, newValue) => {
                        setRatingError(false);
                        // Rating component from Material UI returns a float
                        setRating(Math.round(newValue));
                    }}
                    onChangeActive={(event, newHover) => {
                      setHover(newHover);
                    }}
                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                  />
                  {rating !== null && (
                    <Box sx={{ ml: 2, width: '10rem' }}>
                      {rating_labels[hover !== -1 ? hover : rating]}
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Grid pl={1}>
                  {ratingError && (
                    <Typography variant="caption" color="error">
                      Rating is required!
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                  <TextField
                  margin="dense"
                  label="Comment (optional)"
                  type="text"
                  multiline
                  rows={2}
                  fullWidth
                  value={comment}
                  onChange={(e) => {
                      setComment(e.target.value); 
                      setCharacterCount(e.target.value.length);
                  }}
                  inputProps={{ maxLength: maxCharCount }}
                  />
                  <Typography variant="caption" align="right">
                      Max Characters: {characterCount}/{maxCharCount}
                  </Typography>
              </Grid>
          </Grid>
          {/* Wrap the input in a div to move htmlFor attribute from InputLabel to prevent 
          the label from being clickable but keeping association with the file input*/}
          <div htmlFor="photo-upload" style={{ marginTop: '1rem' }}>
              <InputLabel>Upload a Photo (optional)</InputLabel>
              <input
                  accept="image/*"
                  id="photo-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
              />
              <label htmlFor="photo-upload">
                  <Button variant="outlined" color="primary" component="span" style={{ marginTop: '1rem' }}>
                      Choose Photo
                  </Button>
              </label>
          </div>
          {photo && <Typography variant="body2" style={{ marginTop: '0.5rem' }}>{photo.name}</Typography>}
        </DialogContent>
        <DialogActions>
          {loading ? (
            <CircularProgress sx={{ mr: 2, mb: 1 }} />
          ) : submitted ? (
              <Typography variant="h6" color="#4BB543" style={{ margin: '1rem' }}>Review Submitted!</Typography>
          ) : (
            <>
              <Button onClick={() => handleClose(false)} color="primary" disabled={loading || submitted}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} color="primary">
                Submit Review
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubmitReviewButton;