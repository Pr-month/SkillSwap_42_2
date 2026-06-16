import {
  createSlice,
  type PayloadAction,
  createAction,
} from "@reduxjs/toolkit";
import type { IApiUser } from "../../entities/types";
import { getUserFavourites } from "../../shared/lib/favourites";
import {
  fetchUserData,
  loginUser,
  registerUser,
  updateUserAvatar,
  updateUserData,
} from "./actions";

type TAuthState = {
  currentUser: IApiUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  loginError: string | null;
  registerError: string | null;
  authChecked: boolean;
  favourites: number[];
};

const initialState: TAuthState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  loginError: null,
  registerError: null,
  authChecked: false,
  favourites: [],
};

export const setAuthChecked = createAction<boolean>("auth/setAuthChecked");

export const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("access_token");
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginError = null;
      state.favourites = [];
    },
    clearError: (state) => {
      state.error = null;
      state.loginError = null;
      state.registerError = null;
    },
    setCurrentUser: (state, action: PayloadAction<IApiUser>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    setCurrentUserFavourites: (state, action: PayloadAction<number[]>) => {
      state.favourites = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setAuthChecked, (state, action) => {
        state.authChecked = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.loginError = null;
        state.favourites = getUserFavourites(action.payload.user.id.toString());
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload || "Ошибка авторизации";
        state.isAuthenticated = false;
      })
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.favourites = getUserFavourites(action.payload.user.id.toString());
        state.authChecked = true;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Ошибка при получении данных пользователя";
        state.authChecked = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.registerError = null;
        state.authChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registerError = action.payload || "Ошибка регистрации";
        state.isAuthenticated = false;
      })
      .addCase(updateUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserData.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateUserAvatar.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser!.avatarUrl = action.payload;
      })
      .addCase(updateUserAvatar.rejected, (state) => {
        state.loading = false;
      });
  },
  selectors: {
    selectCurrentUser: (state) => state.currentUser,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectAuthLoading: (state) => state.loading,
    selectAuthError: (state) => state.error,
    selectAuthChecked: (state) => state.authChecked,
    selectCurrentUserFavourites: (state) => state.favourites,
    selectLoginError: (state) => state.loginError,
    selectRegisterError: (state) => state.registerError,
  },
});

export const { logout, clearError, setCurrentUser, setCurrentUserFavourites } =
  userSlice.actions;
export const {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthChecked,
  selectCurrentUserFavourites,
  selectLoginError,
  selectRegisterError,
} = userSlice.selectors;
