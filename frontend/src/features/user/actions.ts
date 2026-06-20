import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  IApiUser,
  ILoginCredentials,
  IRegData,
  TLoginResult,
  TUpdateAvatarData,
  TUserDataForm,
} from "../../entities/types";
import { authApi } from "../../api/auth";
import { setAuthChecked } from "./userSlice";

export const loginUser = createAsyncThunk<
  TLoginResult,
  ILoginCredentials,
  { rejectValue: string }
>("user/login", async (credentials: ILoginCredentials, { rejectWithValue }) => {
  try {
    const result = await authApi.login(credentials);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Неизвестная ошибка авторизации");
  }
});

export const fetchUserData = createAsyncThunk<
  TLoginResult,
  void,
  { rejectValue: string }
>("user/fetchUserData", async (_, { rejectWithValue, dispatch }) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return rejectWithValue("Токен не найден");
    }

    const userData = await authApi.getUser(token);
    return {
      user: userData,
      token,
    };
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Ошибка при получении данных пользователя");
  } finally {
    dispatch(setAuthChecked(true));
  }
});

export const registerUser = createAsyncThunk<
  TLoginResult,
  IRegData,
  { rejectValue: string }
>("user/register", async (data: IRegData, { rejectWithValue }) => {
  try {
    const result = await authApi.registerUser(
      data.form,
      data.avatar,
      data.images,
    );
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Ошибка при регистрации пользователя");
  }
});

export const updateUserData = createAsyncThunk<
  IApiUser,
  TUserDataForm,
  { rejectValue: string }
>("user/update", async (data: TUserDataForm, { rejectWithValue }) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return rejectWithValue("Токен не найден");
  }
  try {
    const result = await authApi.updateUser(data, token);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Ошибка при обновлении данных пользователя");
  }
});

export const updateUserAvatar = createAsyncThunk<
  string,
  TUpdateAvatarData,
  { rejectValue: string }
>("user/updateAvatar", async (data: TUpdateAvatarData, { rejectWithValue }) => {
  try {
    const result = await authApi.updateUserAvatar(data.avatar, data.id);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Ошибка при обновлении аватарки");
  }
});
