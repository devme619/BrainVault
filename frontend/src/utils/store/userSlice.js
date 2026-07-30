import { createSlice } from "@reduxjs/toolkit";

const initialToken = localStorage.getItem("bv_token") || null;
const initialUser = localStorage.getItem("bv_user")
  ? JSON.parse(localStorage.getItem("bv_user"))
  : null;

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    showWelcomeAnimation: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (action.payload.isNewUser) {
        state.showWelcomeAnimation = true;
      }
      localStorage.setItem("bv_token", action.payload.token);
      localStorage.setItem("bv_user", JSON.stringify(action.payload.user));
    },
    dismissWelcomeAnimation: (state) => {
      state.showWelcomeAnimation = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.showWelcomeAnimation = false;
      localStorage.removeItem("bv_token");
      localStorage.removeItem("bv_user");
    },
  },
});

export const { setUser, dismissWelcomeAnimation, logoutUser } = userSlice.actions;
export default userSlice.reducer;
