import { configureStore } from "@reduxjs/toolkit";
import notesReducer from "./notesSlice";
import userReducer from "./userSlice";
import checkAnswersReducer from "./checkAnswersSlice";

const appStore = configureStore({
  reducer: {
    notes: notesReducer,
    user: userReducer,
    checkAnswers: checkAnswersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows storing File/Blob references in Redux
    }),
});

export default appStore;
