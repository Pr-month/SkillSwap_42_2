import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TRegForm } from "../../entities/types";

type TFormsSliceState = {
  reg: TRegForm;
};

const initialState: TFormsSliceState = {
  reg: {
    email: null,
    password: null,
    name: null,
    birthDate: null,
    gender: null,
    location: null,
    categoryWantToLearn: null,
    subcategoryWantToLearn: null,
    skillCanTeach: {
      name: null,
      categoryId: null,
      subcategoryId: null,
      description: null,
    },
  },
};

export const formsSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {
    setRegFormState: (state, action: PayloadAction<Partial<TRegForm>>) => {
      state.reg = { ...state.reg, ...action.payload };
    },
    reset: (state) => {
      state.reg = JSON.parse(JSON.stringify(initialState.reg));
    },
  },
});

export const { setRegFormState, reset } = formsSlice.actions;
