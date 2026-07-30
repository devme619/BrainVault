import { createSlice } from "@reduxjs/toolkit";

const checkAnswersSlice = createSlice({
  name: "checkAnswers",
  initialState: {
    selectedFile: null,
    evaluationData: null,
    activeTab: "report",
  },
  reducers: {
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
      // Reset evaluation output if file changed or cleared
      if (!action.payload) {
        state.evaluationData = null;
      }
    },
    setEvaluationData: (state, action) => {
      state.evaluationData = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetCheckAnswers: (state) => {
      state.selectedFile = null;
      state.evaluationData = null;
      state.activeTab = "report";
    },
  },
});

export const {
  setSelectedFile,
  setEvaluationData,
  setActiveTab,
  resetCheckAnswers,
} = checkAnswersSlice.actions;

export default checkAnswersSlice.reducer;
