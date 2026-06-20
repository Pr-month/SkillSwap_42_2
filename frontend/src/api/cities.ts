import type { ICity } from "../entities/types";
import { apiRequest } from "./base";

type TCitiesResponse = {
  status: number;
  data: {
    cities: ICity[];
  };
  error: string;
};

export const citiesApi = {
  async getCities(): Promise<ICity[]> {
    const response = await apiRequest<TCitiesResponse>("/cities/all", {
      method: "GET",
    });

    return response.data.cities;
  },
};
