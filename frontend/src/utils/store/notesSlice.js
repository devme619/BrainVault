import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
  name: "notes",
  initialState: {
    list: [],
    openedNote: null,
  },
  reducers: {
    setNotes: (state, action) => {
      state.list = action.payload;
    },
    addSingleNote: (state, action) => {
      state.list.push(action.payload);
    },
    setOpenedNote: (state, action) => {
      state.openedNote = action.payload;
    },
    clearOpenedNote: (state) => {
      state.openedNote = null;
    },
  },
});

export const { setNotes, addSingleNote, setOpenedNote, clearOpenedNote } = notesSlice.actions;

export default notesSlice.reducer;
