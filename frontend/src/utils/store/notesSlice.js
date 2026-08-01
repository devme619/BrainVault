import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
  name: "notes",
  initialState: {
    list: [],
    openedNote: null,
    subjectTopicsTree: [],
    selectedSubjectTopic: null, // null means "All Subjects / Notes"
  },
  reducers: {
    setNotes: (state, action) => {
      state.list = action.payload;
    },
    addSingleNote: (state, action) => {
      state.list.unshift(action.payload);
    },
    setOpenedNote: (state, action) => {
      state.openedNote = action.payload;
    },
    clearOpenedNote: (state) => {
      state.openedNote = null;
    },
    setSubjectTopicsTree: (state, action) => {
      state.subjectTopicsTree = action.payload;
    },
    setSelectedSubjectTopic: (state, action) => {
      state.selectedSubjectTopic = action.payload;
    },
    updateNoteContent: (state, action) => {
      const { id, textContent } = action.payload;
      if (state.openedNote && state.openedNote.id === id) {
        state.openedNote.textContent = textContent;
      }
      const noteItem = state.list.find((n) => n.id === id);
      if (noteItem) {
        noteItem.textContent = textContent;
      }
    },
    replaceFileWithText: (state, action) => {
      const { id, textContent } = action.payload;
      if (state.openedNote && state.openedNote.id === id) {
        state.openedNote.fileUrl = null;
        state.openedNote.fileType = null;
        state.openedNote.fileName = null;
        state.openedNote.file = null;
        state.openedNote.textContent = textContent;
      }
      const noteItem = state.list.find((n) => n.id === id);
      if (noteItem) {
        noteItem.fileUrl = null;
        noteItem.fileType = null;
        noteItem.fileName = null;
        noteItem.file = null;
        noteItem.textContent = textContent;
      }
    },
  },
});

export const {
  setNotes,
  addSingleNote,
  setOpenedNote,
  clearOpenedNote,
  setSubjectTopicsTree,
  setSelectedSubjectTopic,
  updateNoteContent,
  replaceFileWithText,
} = notesSlice.actions;

export default notesSlice.reducer;
