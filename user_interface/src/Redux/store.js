import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './menuSlice';
import restaurantReducer from './restaurantSlice';
import authReducer from './authReducer';
import chatReducer from './chatSlice';

const store = configureStore({
  reducer: {
    menu: menuReducer,
    restaurant: restaurantReducer,
    user: authReducer,
    chat: chatReducer,
  },
});

export default store;
