import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ISkillCategory } from "../../entities/types";
import { categoriesApi } from "../../api/categories";

type TCategoriesState = {
  categories: ISkillCategory[];
  loading: boolean;
  status: "idle" | "pending" | "rejected" | "fulfilled";
  error: string | undefined;
};

const initialState: TCategoriesState = {
  categories: [],
  loading: false,
  status: "idle",
  error: undefined,
};

export const getCategories = createAsyncThunk(
  "categories/getCategories",
  categoriesApi.getCategories,
);

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  selectors: {
    categoriesSelector: (state) => state.categories,
    categoriesLoadingSelector: (state) => state.loading,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.status = "pending";
        state.error = undefined;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.status = "rejected";
        state.error = action.error.message;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "fulfilled";
        state.categories = action.payload;
      });
  },
});

export const { categoriesSelector, categoriesLoadingSelector } =
  categoriesSlice.selectors;
