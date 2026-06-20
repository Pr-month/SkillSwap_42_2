import type { IUser } from "../entities/types";
import { apiRequest } from "./base";

type TUsersResponse = {
  status: number;
  data: {
    users: IUser[];
  };
  error: string;
};

export const usersApi = {
  async getUsers(): Promise<IUser[]> {
    const response = await apiRequest<TUsersResponse>("/users/all");
    return response.data.users;
  },
};
