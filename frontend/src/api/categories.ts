import type { ISkillCategory } from "../entities/types";
import { apiRequest } from "./base";

type TCategoriesResponse = {
  status: number;
  data: {
    categories: ISkillCategory[];
  };
  error: string;
};

export const categoriesApi = {
  async getCategories(): Promise<ISkillCategory[]> {
    const response = await apiRequest<TCategoriesResponse>("/categories/all", {
      method: "GET",
    });

    return response.data.categories;
  },
};
