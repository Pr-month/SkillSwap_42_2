import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { usersApi } from "../../api/users";
import type { IUser } from "../../entities/types";

type TUsersState = {
  users: IUser[];
  loading: boolean;
  error: string | undefined;
  selectedUserId: number | null;
};

const initialState: TUsersState = {
  users: [],
  loading: false,
  error: undefined,
  selectedUserId: null,
};

export const getUsers = createAsyncThunk<IUser[], void>(
  "users/getUsers",
  async () => usersApi.getUsers(),
);

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<number>) => {
      state.selectedUserId = action.payload;
    }, //для просмотра детальной информации
    clearSelectedUser: (state) => {
      state.selectedUserId = null;
    },
  },
  selectors: {
    usersSelector: (state) => state.users,
    usersLoadingSelector: (state) => state.loading,
    selectedUserSelector: (state) => {
      return state.users.find((user) => user.id === state.selectedUserId);
    },
    userByIdSelector: (state, id: number) =>
      state.users.find((user) => user.id === id),
    usersBySkillIdSelector: (state, skillId: number) => {
      return state.users.filter((user) => user.skillCanTeach.id === skillId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      });
  },
});

export const { selectUser, clearSelectedUser } = usersSlice.actions;
export const {
  usersSelector,
  usersLoadingSelector,
  selectedUserSelector,
  userByIdSelector,
  usersBySkillIdSelector,
} = usersSlice.selectors;
