import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import {
  usersSlice,
  getUsers,
  selectUser,
  clearSelectedUser,
} from "./usersSlice";
import type { IUser, TSkill, ISubcategory } from "../../entities/types";
import { usersApi } from "../../api/users";

jest.mock("../../api/users", () => ({
  usersApi: {
    getUsers: jest.fn(),
  },
}));

const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;

type RootStateForUsers = {
  users: {
    users: IUser[];
    loading: boolean;
    error: string | undefined;
    selectedUserId: number | null;
  };
};

describe("usersSlice", () => {
  const mockSkill: TSkill = {
    id: 1,
    name: "JavaScript",
    fullDescription: "JavaScript programming",
    categoryId: 1,
    subCategoryId: 1,
  };

  const mockSubcategory: ISubcategory = {
    id: 1,
    name: "Frontend",
  };

  const mockUsers: IUser[] = [
    {
      id: 1,
      name: "John Doe",
      location: "New York",
      likes: 10,
      isLiked: false,
      age: "30",
      createdAt: "2023-01-01",
      description: "Frontend developer",
      avatarUrl: "avatar1.jpg",
      skillCanTeach: mockSkill,
      subcategoriesWantToLearn: [mockSubcategory],
      gender: "male",
      images: ["image1.jpg"],
      email: "john@example.com",
    },
    {
      id: 2,
      name: "Jane Smith",
      location: "London",
      likes: 20,
      isLiked: true,
      age: "25",
      createdAt: "2023-02-01",
      description: "Backend developer",
      avatarUrl: "avatar2.jpg",
      skillCanTeach: { ...mockSkill, id: 2 },
      subcategoriesWantToLearn: [],
      gender: "female",
      images: [],
      email: "jane@example.com",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialState", () => {
    it("должен иметь правильное начальное состояние", () => {
      const state = usersSlice.reducer(undefined, { type: "unknown" });
      expect(state).toEqual({
        users: [],
        loading: false,
        error: undefined,
        selectedUserId: null,
      });
    });
  });

  describe("reducers", () => {
    describe("selectUser", () => {
      it("должен установить selectedUserId", () => {
        const initialState = usersSlice.getInitialState();
        const state = usersSlice.reducer(initialState, selectUser(1));
        expect(state.selectedUserId).toBe(1);
      });

      it("должен перезаписать existing selectedUserId", () => {
        const initialState = {
          ...usersSlice.getInitialState(),
          selectedUserId: 1,
        };
        const state = usersSlice.reducer(initialState, selectUser(2));
        expect(state.selectedUserId).toBe(2);
      });
    });

    describe("clearSelectedUser", () => {
      it("должен очистить selectedUserId", () => {
        const initialState = {
          ...usersSlice.getInitialState(),
          selectedUserId: 1,
        };
        const state = usersSlice.reducer(initialState, clearSelectedUser());
        expect(state.selectedUserId).toBeNull();
      });

      it("должен остаться null если уже null", () => {
        const initialState = usersSlice.getInitialState();
        const state = usersSlice.reducer(initialState, clearSelectedUser());
        expect(state.selectedUserId).toBeNull();
      });
    });
  });

  describe("selectors", () => {
    const mockRootState: RootStateForUsers = {
      users: {
        users: mockUsers,
        loading: false,
        error: undefined,
        selectedUserId: 1,
      },
    };

    describe("usersSelector", () => {
      it("должен возвращать всех пользователей", () => {
        expect(usersSlice.selectors.usersSelector(mockRootState)).toEqual(
          mockUsers,
        );
      });

      it("должен возвращать пустой массив если пользователей нет", () => {
        const emptyState: RootStateForUsers = {
          users: {
            users: [],
            loading: false,
            error: undefined,
            selectedUserId: null,
          },
        };
        expect(usersSlice.selectors.usersSelector(emptyState)).toEqual([]);
      });
    });

    describe("usersLoadingSelector", () => {
      it("должен возвращать состояние загрузки", () => {
        const loadingState: RootStateForUsers = {
          users: {
            ...mockRootState.users,
            loading: true,
          },
        };
        expect(usersSlice.selectors.usersLoadingSelector(loadingState)).toBe(
          true,
        );
      });
    });

    describe("selectedUserSelector", () => {
      it("должен возвращать выбранного пользователя", () => {
        const user = usersSlice.selectors.selectedUserSelector(mockRootState);
        expect(user).toEqual(mockUsers[0]);
      });

      it("должен возвращать undefined если пользователь не выбран", () => {
        const stateWithoutSelection: RootStateForUsers = {
          users: {
            ...mockRootState.users,
            selectedUserId: null,
          },
        };
        expect(
          usersSlice.selectors.selectedUserSelector(stateWithoutSelection),
        ).toBeUndefined();
      });

      it("должен возвращать undefined если выбранного пользователя нет в списке", () => {
        const stateWithInvalidSelection: RootStateForUsers = {
          users: {
            ...mockRootState.users,
            selectedUserId: 999,
          },
        };
        expect(
          usersSlice.selectors.selectedUserSelector(stateWithInvalidSelection),
        ).toBeUndefined();
      });
    });

    describe("userByIdSelector", () => {
      it("должен возвращать пользователя по ID", () => {
        const user = usersSlice.selectors.userByIdSelector(mockRootState, 2);
        expect(user).toEqual(mockUsers[1]);
      });

      it("должен возвращать undefined если пользователь не найден", () => {
        const user = usersSlice.selectors.userByIdSelector(mockRootState, 999);
        expect(user).toBeUndefined();
      });
    });

    describe("usersBySkillIdSelector", () => {
      it("должен возвращать пользователей по skillId", () => {
        const users = usersSlice.selectors.usersBySkillIdSelector(
          mockRootState,
          1,
        );
        expect(users).toHaveLength(1);
        expect(users[0].id).toBe(1);
        expect(users[0].skillCanTeach.id).toBe(1);
      });

      it("должен возвращать пустой массив если нет пользователей с таким skillId", () => {
        const users = usersSlice.selectors.usersBySkillIdSelector(
          mockRootState,
          999,
        );
        expect(users).toEqual([]);
      });

      it("должен возвращать всех пользователей с указанным skillId", () => {
        const usersWithSameSkill: IUser[] = [
          ...mockUsers,
          {
            ...mockUsers[0],
            id: 3,
            skillCanTeach: { ...mockSkill, id: 1 },
          },
        ];
        const state: RootStateForUsers = {
          users: {
            ...mockRootState.users,
            users: usersWithSameSkill,
          },
        };
        const users = usersSlice.selectors.usersBySkillIdSelector(state, 1);
        expect(users).toHaveLength(2);
        expect(users.map((u) => u.id)).toEqual([1, 3]);
      });
    });
  });

  describe("extraReducers", () => {
    describe("getUsers", () => {
      it("должен обрабатывать pending состояние", () => {
        const initialState = usersSlice.getInitialState();
        const action = { type: getUsers.pending.type };
        const state = usersSlice.reducer(initialState, action);

        expect(state).toEqual({
          users: [],
          loading: true,
          error: undefined,
          selectedUserId: null,
        });
      });

      it("должен обрабатывать fulfilled состояние", () => {
        const initialState = { ...usersSlice.getInitialState(), loading: true };
        const action = {
          type: getUsers.fulfilled.type,
          payload: mockUsers,
        };
        const state = usersSlice.reducer(initialState, action);

        expect(state).toEqual({
          users: mockUsers,
          loading: false,
          error: undefined,
          selectedUserId: null,
        });
      });

      it("должен обрабатывать rejected состояние", () => {
        const initialState = { ...usersSlice.getInitialState(), loading: true };
        const action = {
          type: getUsers.rejected.type,
          error: { message: "Network error" },
        };
        const state = usersSlice.reducer(initialState, action);

        expect(state).toEqual({
          users: [],
          loading: false,
          error: "Network error",
          selectedUserId: null,
        });
      });

      it("должен сохранять порядок пользователей", () => {
        const reversedUsers = [...mockUsers].reverse();
        const initialState = { ...usersSlice.getInitialState(), loading: true };
        const action = {
          type: getUsers.fulfilled.type,
          payload: reversedUsers,
        };
        const state = usersSlice.reducer(initialState, action);

        expect(state).toEqual({
          users: reversedUsers,
          loading: false,
          error: undefined,
          selectedUserId: null,
        });
      });

      it("должен заменять существующих пользователей при новом запросе", () => {
        const initialState = {
          users: [mockUsers[0]],
          loading: true,
          error: undefined,
          selectedUserId: null,
        };
        const action = {
          type: getUsers.fulfilled.type,
          payload: [mockUsers[1]],
        };
        const state = usersSlice.reducer(initialState, action);

        expect(state).toEqual({
          users: [mockUsers[1]],
          loading: false,
          error: undefined,
          selectedUserId: null,
        });
      });
    });
  });

  describe("интеграционные тесты с store", () => {
    it("должен корректно взаимодействовать с API", async () => {
      const store = configureStore({
        reducer: {
          users: usersSlice.reducer,
        },
      });

      mockUsersApi.getUsers.mockResolvedValueOnce(mockUsers);

      await store.dispatch(getUsers());
      const state = store.getState();

      expect(state).toEqual({
        users: {
          users: mockUsers,
          loading: false,
          error: undefined,
          selectedUserId: null,
        },
      });
      expect(mockUsersApi.getUsers).toHaveBeenCalledTimes(1);
    });

    it("должен обрабатывать несколько последовательных действий", async () => {
      const store = configureStore({
        reducer: {
          users: usersSlice.reducer,
        },
      });

      mockUsersApi.getUsers.mockResolvedValueOnce(mockUsers);

      await store.dispatch(getUsers());

      store.dispatch(selectUser(1));

      store.dispatch(clearSelectedUser());

      const state = store.getState();
      expect(state).toEqual({
        users: {
          users: mockUsers,
          loading: false,
          error: undefined,
          selectedUserId: null,
        },
      });
    });
  });
});
