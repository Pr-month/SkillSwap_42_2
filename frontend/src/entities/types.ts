export interface ICity {
  id: number;
  name: string;
}

export interface ISubcategory {
  id: number;
  name: string;
}

export interface ISkillCategory {
  id: number;
  name: string;
  subcategories: ISubcategory[];
}

export type TSkill = {
  id: number;
  name: string;
  fullDescription: string;
  categoryId: number;
  subCategoryId: number;
};

export interface IUser {
  id: number;
  name: string;
  location: string;
  likes: number;
  isLiked: boolean;
  age: string;
  createdAt: string;
  description: string;
  avatarUrl: string;
  skillCanTeach: TSkill;
  subcategoriesWantToLearn: ISubcategory[];
  gender: "male" | "female" | "not specified";
  images: string[];
  email: string;
}

export type TFilters = {
  mode: "all" | "teach" | "learn";
  gender: "no_matter" | "male" | "female";
  cityNames: string[];
  skillIds: number[];
  searchInputValue?: string;
};

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IApiUser {
  id: number;
  name: string;
  email: string;
  location: string;
  gender: string;
  avatarUrl: string;
  description: string;
  birthDate: string;
}

export interface ILoginResponse {
  status: number;
  data: {
    access_token: string;
    token_type: string;
    user: IApiUser;
  };
  error: string;
}

export interface IUserResponse {
  status: number;
  data: {
    user: IApiUser;
  };
  error: string;
}

export interface IAvatarResponse {
  status: number;
  data: {
    avatar: string;
  };
  error: string;
}

export interface IUploadedFile extends File {
  preview?: string;
  id: string;
}

export type TRegForm = {
  email: string | null;
  password: string | null;
  name: string | null;
  birthDate: string | null;
  gender: "male" | "female" | "not specified" | null;
  location: string | null;
  categoryWantToLearn: number[] | null;
  subcategoryWantToLearn: number[] | null;
  skillCanTeach: {
    name: string | null;
    categoryId: number | null;
    subcategoryId: number | null;
    description: string | null;
  };
};

export type TUserDataForm = Omit<
  TRegForm,
  | "categoryWantToLearn"
  | "subcategoryWantToLearn"
  | "skillCanTeach"
  | "password"
> & { userDescription: string };

export interface IRegData {
  form: TRegForm;
  avatar: File;
  images: File[];
}

export type TLoginResult = {
  user: IApiUser;
  token: string;
};

export type TUpdateAvatarData = {
  avatar: File;
  id: string;
};
