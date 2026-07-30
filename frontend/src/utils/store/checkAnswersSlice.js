import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { convertFileToText } from "../../apis/evaluationAPIs";

export const triggerAIEvaluation = createAsyncThunk(
  "checkAnswers/triggerAIEvaluation",
  async ({ file, aiOptions }, { rejectWithValue }) => {
    try {
      const data = await convertFileToText(file, aiOptions);
      if (data.evaluation_report?.error) {
        return rejectWithValue(data.evaluation_report.error);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to process evaluation");
    }
  }
);

const checkAnswersSlice = createSlice({
  name: "checkAnswers",
  initialState: {
    selectedFile: null,
    evaluationData: null,
    isEvaluating: false,
    evaluationError: null,
    activeTab: "report",
  },
  reducers: {
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
      if (!action.payload) {
        state.evaluationData = null;
        state.isEvaluating = false;
        state.evaluationError = null;
      }
    },
    setEvaluationData: (state, action) => {
      state.evaluationData = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    clearEvaluationError: (state) => {
      state.evaluationError = null;
    },
    resetCheckAnswers: (state) => {
      state.selectedFile = null;
      state.evaluationData = null;
      state.isEvaluating = false;
      state.evaluationError = null;
      state.activeTab = "report";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerAIEvaluation.pending, (state) => {
        state.isEvaluating = true;
        state.evaluationError = null;
      })
      .addCase(triggerAIEvaluation.fulfilled, (state, action) => {
        state.isEvaluating = false;
        state.evaluationData = action.payload;
        if (action.payload?.evaluation_report && !action.payload.evaluation_report.error) {
          state.activeTab = "report";
        } else {
          state.activeTab = "text";
        }
      })
      .addCase(triggerAIEvaluation.rejected, (state, action) => {
        state.isEvaluating = false;
        state.evaluationError = action.payload || "Evaluation failed";
      });
  },
});

export const {
  setSelectedFile,
  setEvaluationData,
  setActiveTab,
  clearEvaluationError,
  resetCheckAnswers,
} = checkAnswersSlice.actions;

export default checkAnswersSlice.reducer;
