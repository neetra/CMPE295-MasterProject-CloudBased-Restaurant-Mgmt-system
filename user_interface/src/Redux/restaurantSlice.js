import { createSlice } from '@reduxjs/toolkit';

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState: {
    id: null,
    name: '',
    imageURL: '',
  },
  reducers: {
    setRestaurantId: (state, action) => {
      state.id = action.payload;
    },
    setRestaurantName: (state, action) => {
      state.name = action.payload;
    },
    setRestaurantImage: (state, action) => {
      state.imageURL = action.payload;
    },
  },
});

export const { setRestaurantId, setRestaurantName, setRestaurantImage } = restaurantSlice.actions;
export default restaurantSlice.reducer;
