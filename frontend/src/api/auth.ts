import type {
  IApiUser,
  ILoginResponse,
  IUserResponse,
  ILoginCredentials,
  TRegForm,
  IAvatarResponse,
  TUserDataForm,
} from "../entities/types";
import { apiRequest, apiFileRequest } from "./base";

export const authApi = {
  async login(credentials: ILoginCredentials): Promise<{
    user: IApiUser;
    token: string;
  }> {
    const response = await apiRequest<ILoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.status === 200 && response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);

      return {
        user: response.data.user,
        token: response.data.access_token,
      };
    } else {
      throw new Error(response.error || "Ошибка авторизации");
    }
  },

  async getUser(token: string): Promise<IApiUser> {
    const response = await apiRequest<IUserResponse>("/user/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  },

  async registerUser(
    data: TRegForm,
    avatar?: File,
    images?: File[],
  ): Promise<{
    user: IApiUser;
    token: string;
  }> {
    let resultUser: IApiUser = {
      id: 0,
      name: "",
      email: "",
      location: "",
      gender: "",
      avatarUrl: "",
      description: "",
      birthDate: "",
    };
    const imagesData = new FormData();

    const userResponse = await apiRequest<ILoginResponse>("/user/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (userResponse.status === 200 && userResponse.data.access_token) {
      localStorage.setItem("access_token", userResponse.data.access_token);
      resultUser = userResponse.data.user;
    } else {
      throw new Error(userResponse.error || "Ошибка регистрации");
    }
    const id = resultUser.id;
    if (avatar) {
      const avatarData = new FormData();
      avatarData.append("file", avatar);
      const avatarResponse = await apiFileRequest<IAvatarResponse>(
        `/user/${id}/avatar`,
        {
          method: "POST",
          body: avatarData,
        },
      );
      if (avatarResponse.status === 200 && avatarResponse.data.avatar) {
        resultUser.avatarUrl = avatarResponse.data.avatar;
      } else {
        throw new Error(avatarResponse.error || "Ошибка при загрузке аватара");
      }
      resultUser.avatarUrl = avatarResponse.data.avatar;
    }

    if (Array.isArray(images) && images.length > 0) {
      images.forEach((image) => imagesData.append("files", image));

      const imagesReponse = await apiFileRequest<{
        status: number;
        error: string;
      }>(`/user/${id}/images`, {
        method: "POST",
        body: imagesData,
      });

      if (imagesReponse.status !== 200) {
        throw new Error(
          imagesReponse.error || "Ошибка при загрузке изображений",
        );
      }
    }
    return { user: resultUser, token: userResponse.data.access_token };
  },

  async updateUser(data: TUserDataForm, token: string): Promise<IApiUser> {
    const response = await apiRequest<IUserResponse>("/user/", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (response.status === 200) {
      return response.data.user;
    } else {
      throw new Error(
        response.error || "Ошибка обновления данных пользователя",
      );
    }
  },

  async updateUserAvatar(avatar: File, id: string) {
    const avatarData = new FormData();
    avatarData.append("file", avatar);

    const response = await apiFileRequest<IAvatarResponse>(
      `/user/${id}/avatar`,
      {
        method: "PATCH",
        body: avatarData,
      },
    );
    if (response.status === 200) {
      return response.data.avatar;
    } else {
      throw new Error(
        response.error || "Ошибка обновления данных пользователя",
      );
    }
  },
};
