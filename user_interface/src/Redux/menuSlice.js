import { createSlice } from '@reduxjs/toolkit';


const loadFromLocalStorage = (key) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return [];
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.log(`Error loading ${key} from local storage:`, error);
    return [];
  }
};

const saveToLocalStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.log(`Error saving ${key} to local storage:`, error);
  }
};

const initialState = {
  menuItems: [],
  reviews: [],
  cart: loadFromLocalStorage('cart'),
  orderedItems: loadFromLocalStorage('orderedItems'),
  ifOrdered:loadFromLocalStorage('ifOrdered'),
  orderId:loadFromLocalStorage('orderId')
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenuItems: (state, action) => {
      state.menuItems = action.payload;
    },
    addToMenuItems: (state, action) => {
      state.menuItems.push(action.payload);
    },
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    updateMenuItem: (state, action) => {
      const index = state.menuItems.findIndex((item) => item.Item_id === action.payload.Item_id);
      // console.log("Item_id:", action.payload.Item_id);
      if (index !== -1) {
        state.menuItems[index] = action.payload;
      }
    },
    addToCart: (state, action) => {
      const item = state.cart.find((i) => i.Item_id === action.payload.item.Item_id);
      const quantity = action.payload.quantity;
      if (item) {
        item.quantity += quantity;
      } else {
        state.cart.push({ ...action.payload.item, quantity });
      }
      saveToLocalStorage('cart', state.cart);
    },
    removeFromCart: (state, action) => {
      const index = state.cart.findIndex((i) => i.Item_id === action.payload);
      if (state.cart[index].quantity > 1) {
        state.cart[index].quantity -= 1;
      } else {
        state.cart.splice(index, 1);
      }
      saveToLocalStorage('cart', state.cart);
    },
    addToOrderedItems: (state, action) => {
      const updatedOrderedItems = [...state.orderedItems, action.payload];
      saveToLocalStorage('orderedItems', updatedOrderedItems);
      console.log("orderedItems changed: ", localStorage.getItem('orderedItems'));
      return {
        ...state,
        orderedItems: updatedOrderedItems,
      };
    },
    setIfOrdered: (state, action) => {
      state.ifOrdered = action.payload;
      saveToLocalStorage('ifOrdered', state.ifOrdered);
      (console.log("ifordered changed: ", localStorage.getItem('ifOrdered')))
    },
    setOrderId: (state, action) => {
      state.orderId = action.payload;
      saveToLocalStorage('orderId', state.orderId);
      (console.log("orderId changed: ", localStorage.getItem('orderId')))
    },
    // flushCart: (state) => {
    //   while (state.cart.length) {
    //     const itemId = state.cart[0].Item_id;
    //     state = cartReducer(state, removeFromCart(itemId));
    //   }
    // },
  },
});

export const { setMenuItems, 
  addToMenuItems,
  setReviews,
  updateMenuItem,
  addToCart,
  removeFromCart,
  addToOrderedItems,
  setIfOrdered,
  setOrderId,
  flushCart } = menuSlice.actions;
export default menuSlice.reducer;
