import { createSlice } from "@reduxjs/toolkit";
// import jwt_decode from 'jwt-decode';

    export const authSlice = createSlice({
        name: "auth",
        initialState: {
            user: null
        },
        reducers: {
            login: (state, action) => {
                console.log(action?.payload)
                localStorage.setItem('profile', JSON.stringify({ ...action?.payload }));
                return { ...state, user: action?.payload }
            },
            logout: (state) => {
                console.log('logout')
                localStorage.clear();
                return { ...state, user: null }
            }
        },
    });

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;