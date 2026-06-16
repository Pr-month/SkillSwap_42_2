import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { TFilters } from "../../entities/types";

type TFiltersState = {
  filters: TFilters;
};

const initialState: TFiltersState = {
  filters: {
    mode: "all",
    gender: "no_matter",
    skillIds: [],
    cityNames: [],
    searchInputValue: "",
  },
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: () => initialState,
  },
  selectors: {
    isNotEmptySelector: (state) =>
      state.filters.cityNames.length > 0 ||
      state.filters.skillIds.length > 0 ||
      state.filters.mode !== initialState.filters.mode ||
      state.filters.gender !== initialState.filters.gender ||
      state.filters.searchInputValue?.trim(),
    filtersCounterSelector: (state) =>
      state.filters.cityNames.length +
      state.filters.skillIds.length +
      (state.filters.mode !== initialState.filters.mode ? 1 : 0) +
      (state.filters.gender !== initialState.filters.gender ? 1 : 0) +
      (state.filters.searchInputValue?.trim() ? 1 : 0),
    isNotEmptyWithoutSearchSelector: (state) =>
      state.filters.cityNames.length > 0 ||
      state.filters.skillIds.length > 0 ||
      state.filters.mode !== initialState.filters.mode ||
      state.filters.gender !== initialState.filters.gender,
  },
});

export const { setFilters, resetFilters } = filtersSlice.actions;
export const {
  isNotEmptySelector,
  filtersCounterSelector,
  isNotEmptyWithoutSearchSelector,
} = filtersSlice.selectors;
export default filtersSlice.reducer;
