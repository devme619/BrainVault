import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
  name: "notes",
  initialState: [],
  reducers: {
    setNotes: (state, action) => {
      return action.payload;
    },
    addSingleNote: (state, action) => {
      state.push(action.payload);
    },
  },
});

export const { setNotes, addSingleNote } = notesSlice.actions;

export default notesSlice.reducer;
