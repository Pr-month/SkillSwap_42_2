import { configureStore } from "@reduxjs/toolkit";
import { citiesApi } from "../../api/cities";
import type { ICity } from "../../entities/types";
import { citiesSlice, getCities } from "./citiesSlice";

jest.mock("../../api/cities", () => ({
  citiesApi: {
    getCities: jest.fn(),
  },
}));

const mockedCitiesApi = jest.mocked(citiesApi);

describe("citiesSlice", () => {
  const initialState = citiesSlice.getInitialState();

  const mockCities: ICity[] = [
    { id: 1, name: "Москва" },
    { id: 2, name: "Санкт-Петербург" },
    { id: 3, name: "Новосибирск" },
  ];

  const mockRootState = {
    cities: {
      cities: mockCities,
      loading: false,
      status: "fulfilled" as const,
      error: undefined,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("reducer", () => {
    it("should return initial state", () => {
      const state = citiesSlice.reducer(undefined, { type: "unknown" });
      expect(state).toEqual(initialState);
    });

    it("should handle getCities.pending", () => {
      const action = { type: getCities.pending.type };
      const state = citiesSlice.reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loading: true,
        status: "pending",
      });
    });

    it("should handle getCities.fulfilled", () => {
      const action = {
        type: getCities.fulfilled.type,
        payload: mockCities,
      };
      const state = citiesSlice.reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        cities: mockCities,
        loading: false,
        status: "fulfilled",
      });
    });

    it("should handle getCities.rejected", () => {
      const errorMessage = "Network error";
      const action = {
        type: getCities.rejected.type,
        error: { message: errorMessage },
      };
      const state = citiesSlice.reducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loading: false,
        status: "rejected",
        error: errorMessage,
      });
    });
  });

  describe("async thunk getCities", () => {
    it("should dispatch fulfilled when api call succeeds", async () => {
      mockedCitiesApi.getCities.mockResolvedValue(mockCities);

      const store = configureStore({
        reducer: {
          cities: citiesSlice.reducer,
        },
      });

      await store.dispatch(getCities());

      const state = store.getState().cities;

      expect(state).toEqual({
        cities: mockCities,
        loading: false,
        status: "fulfilled",
        error: undefined,
      });
      expect(mockedCitiesApi.getCities).toHaveBeenCalledTimes(1);
    });

    it("should dispatch rejected when api call fails", async () => {
      const errorMessage = "Failed to fetch cities";
      mockedCitiesApi.getCities.mockRejectedValue(new Error(errorMessage));

      const store = configureStore({
        reducer: {
          cities: citiesSlice.reducer,
        },
      });

      await store.dispatch(getCities());

      const state = store.getState().cities;

      expect(state).toEqual({
        cities: [],
        loading: false,
        status: "rejected",
        error: errorMessage,
      });
    });
  });

  describe("selectors", () => {
    it("citiesSelector should return cities array", () => {
      const result = citiesSlice.selectors.citiesSelector(mockRootState);
      expect(result).toEqual(mockCities);
    });

    it("citiesLoadingSelector should return loading state", () => {
      const result = citiesSlice.selectors.citiesLoadingSelector(mockRootState);
      expect(result).toBe(false);
    });

    it("citiesSelector should return empty array when no cities", () => {
      const rootState = {
        cities: {
          cities: [],
          loading: false,
          status: "idle" as const,
          error: undefined,
        },
      };

      const result = citiesSlice.selectors.citiesSelector(rootState);
      expect(result).toEqual([]);
    });
  });

  describe("extraReducers status changes", () => {
    it("should have correct status flow", () => {
      let state = citiesSlice.reducer(initialState, {
        type: getCities.pending.type,
      });
      expect(state.status).toBe("pending");
      expect(state.loading).toBe(true);

      state = citiesSlice.reducer(state, {
        type: getCities.fulfilled.type,
        payload: mockCities,
      });
      expect(state.status).toBe("fulfilled");
      expect(state.loading).toBe(false);

      state = citiesSlice.reducer(initialState, {
        type: getCities.rejected.type,
        error: { message: "error" },
      });
      expect(state.status).toBe("rejected");
      expect(state.loading).toBe(false);
    });
  });
});
