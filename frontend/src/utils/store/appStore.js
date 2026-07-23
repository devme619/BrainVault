import { configureStore } from "@reduxjs/toolkit";
import notesReducer from "./notesSlice";

const appStore = configureStore({
  reducer: { notes: notesReducer },
});

export default appStore;
