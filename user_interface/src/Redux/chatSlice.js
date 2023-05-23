import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  responses: [
    { user: "", bot: "Hi! How can I help you today? Ask me anything about food!", isTyping: false },
  ],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addResponse: (state, action) => {
      state.responses.push({ ...action.payload, isTyping: true });
    },
    updateLastResponse: (state, action) => {
      state.responses[state.responses.length - 1] = { ...action.payload, isTyping: false };
    },
  },
});

export const { addResponse, updateLastResponse } = chatSlice.actions;
export default chatSlice.reducer;