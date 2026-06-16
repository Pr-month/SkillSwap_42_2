import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";
import {
  categoriesSlice,
  getCategories,
  categoriesSelector,
  categoriesLoadingSelector,
} from "./categoriesSlice";
import type { ISkillCategory, ISubcategory } from "../../entities/types";
import { categoriesApi } from "../../api/categories";

jest.mock("../../api/categories", () => ({
  categoriesApi: {
    getCategories: jest.fn(),
  },
}));

const mockedCategoriesApi = jest.mocked(categoriesApi);

type RootStateForCategories = {
  categories: {
    categories: ISkillCategory[];
    loading: boolean;
    status: "idle" | "pending" | "rejected" | "fulfilled";
    error: string | undefined;
  };
};

describe("categoriesSlice", () => {
  const mockSubcategories: ISubcategory[] = [
    { id: 1, name: "Frontend" },
    { id: 2, name: "Backend" },
    { id: 3, name: "Mobile" },
  ];

  const mockCategories: ISkillCategory[] = [
    {
      id: 1,
      name: "Web Development",
      subcategories: mockSubcategories,
    },
    {
      id: 2,
      name: "Mobile Development",
      subcategories: [
        { id: 4, name: "iOS" },
        { id: 5, name: "Android" },
      ],
    },
    {
      id: 3,
      name: "Data Science",
      subcategories: [
        { id: 6, name: "Machine Learning" },
        { id: 7, name: "Big Data" },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialState", () => {
    it("должен иметь правильное начальное состояние", () => {
      expect(categoriesSlice.reducer(undefined, { type: "unknown" })).toEqual({
        categories: [],
        loading: false,
        status: "idle",
        error: undefined,
      });
    });
  });

  describe("selectors", () => {
    const mockRootState: RootStateForCategories = {
      categories: {
        categories: mockCategories,
        loading: false,
        status: "fulfilled",
        error: undefined,
      },
    };

    describe("categoriesSelector", () => {
      it("должен возвращать все категории", () => {
        expect(categoriesSelector(mockRootState)).toEqual(mockCategories);
      });

      it("должен возвращать пустой массив если категорий нет", () => {
        const emptyState: RootStateForCategories = {
          categories: {
            categories: [],
            loading: false,
            status: "idle",
            error: undefined,
          },
        };
        expect(categoriesSelector(emptyState)).toEqual([]);
      });
    });

    describe("categoriesLoadingSelector", () => {
      it("должен возвращать false когда loading = false", () => {
        expect(categoriesLoadingSelector(mockRootState)).toBe(false);
      });

      it("должен возвращать true когда loading = true", () => {
        const loadingState: RootStateForCategories = {
          categories: {
            ...mockRootState.categories,
            loading: true,
          },
        };
        expect(categoriesLoadingSelector(loadingState)).toBe(true);
      });
    });
  });

  describe("extraReducers", () => {
    describe("getCategories", () => {
      it("должен обрабатывать pending состояние", () => {
        const initialState = categoriesSlice.getInitialState();
        const action = { type: getCategories.pending.type };
        const state = categoriesSlice.reducer(initialState, action);

        expect(state).toEqual({
          categories: [],
          loading: true,
          status: "pending",
          error: undefined,
        });
      });

      it("должен обрабатывать fulfilled состояние", () => {
        const initialState = {
          ...categoriesSlice.getInitialState(),
          loading: true,
          status: "pending" as const,
        };

        const action = {
          type: getCategories.fulfilled.type,
          payload: mockCategories,
        };

        const state = categoriesSlice.reducer(initialState, action);

        expect(state).toEqual({
          categories: mockCategories,
          loading: false,
          status: "fulfilled",
          error: undefined,
        });
      });

      it("должен обрабатывать rejected состояние", () => {
        const initialState = {
          ...categoriesSlice.getInitialState(),
          loading: true,
          status: "pending" as const,
        };

        const action = {
          type: getCategories.rejected.type,
          error: { message: "Network error" },
        };

        const state = categoriesSlice.reducer(initialState, action);

        expect(state).toEqual({
          categories: [],
          loading: false,
          status: "rejected",
          error: "Network error",
        });
      });

      it("должен заменять существующие категории при новом запросе", () => {
        const initialState = {
          categories: [mockCategories[0]],
          loading: true,
          status: "pending" as const,
          error: undefined,
        };

        const action = {
          type: getCategories.fulfilled.type,
          payload: [mockCategories[1], mockCategories[2]],
        };

        const state = categoriesSlice.reducer(initialState, action);

        expect(state).toEqual({
          categories: [mockCategories[1], mockCategories[2]],
          loading: false,
          status: "fulfilled",
          error: undefined,
        });
      });

      it("должен сбрасывать ошибку при новом pending запросе", () => {
        const initialState = {
          categories: [],
          loading: false,
          status: "rejected" as const,
          error: "Previous error",
        };

        const action = { type: getCategories.pending.type };
        const state = categoriesSlice.reducer(initialState, action);

        expect(state).toEqual({
          categories: [],
          loading: true,
          status: "pending",
          error: undefined,
        });
      });

      it("должен сохранять порядок категорий", () => {
        const reversedCategories = [...mockCategories].reverse();
        const initialState = {
          ...categoriesSlice.getInitialState(),
          loading: true,
          status: "pending" as const,
        };

        const action = {
          type: getCategories.fulfilled.type,
          payload: reversedCategories,
        };

        const state = categoriesSlice.reducer(initialState, action);

        expect(state).toEqual({
          categories: reversedCategories,
          loading: false,
          status: "fulfilled",
          error: undefined,
        });
      });

      it("должен корректно обрабатывать ошибку при отсутствии message в error", () => {
        const initialState = {
          ...categoriesSlice.getInitialState(),
          loading: true,
          status: "pending" as const,
        };

        const action = {
          type: getCategories.rejected.type,
          error: { code: "500" },
        };

        const state = categoriesSlice.reducer(initialState, action);

        expect(state).toEqual({
          categories: [],
          loading: false,
          status: "rejected",
          error: undefined,
        });
      });
    });
  });

  describe("статус состояния", () => {
    it("должен правильно обновлять status при разных состояниях", () => {
      let state = categoriesSlice.getInitialState();

      state = categoriesSlice.reducer(state, {
        type: getCategories.pending.type,
      });
      expect(state).toEqual({
        categories: [],
        loading: true,
        status: "pending",
        error: undefined,
      });

      state = categoriesSlice.reducer(state, {
        type: getCategories.fulfilled.type,
        payload: mockCategories,
      });
      expect(state).toEqual({
        categories: mockCategories,
        loading: false,
        status: "fulfilled",
        error: undefined,
      });
    });
  });

  describe("интеграционные тесты с store", () => {
    it("должен корректно взаимодействовать с API", async () => {
      const store = configureStore({
        reducer: {
          categories: categoriesSlice.reducer,
        },
      });

      mockedCategoriesApi.getCategories.mockResolvedValueOnce(mockCategories);

      await store.dispatch(getCategories());
      const state = store.getState();

      expect(state).toEqual({
        categories: {
          categories: mockCategories,
          loading: false,
          status: "fulfilled",
          error: undefined,
        },
      });
    });

    it("должен обрабатывать ошибки при загрузке", async () => {
      const store = configureStore({
        reducer: {
          categories: categoriesSlice.reducer,
        },
      });

      const errorMessage = "Failed to fetch categories";
      mockedCategoriesApi.getCategories.mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await store.dispatch(getCategories());
      const state = store.getState();

      expect(state).toEqual({
        categories: {
          categories: [],
          loading: false,
          status: "rejected",
          error: errorMessage,
        },
      });
    });
  });
});
