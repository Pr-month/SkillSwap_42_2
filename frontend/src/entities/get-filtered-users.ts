import type { TFilters, IUser } from "./types";

export const getFilteredUsers = (
  users: IUser[],
  filters: TFilters,
): IUser[] => {
  const { cityNames, gender, mode, skillIds, searchInputValue } = filters;

  const query = searchInputValue?.trim();

  if (!query) {
    return users
      .filter((user) => gender === "no_matter" || gender === user.gender)
      .filter((user) => !cityNames.length || cityNames.includes(user.location))
      .filter(
        (user) =>
          !skillIds.length ||
          (mode !== "teach" &&
            skillIds.includes(user.skillCanTeach.subCategoryId)) ||
          (mode !== "learn" &&
            user.subcategoriesWantToLearn.some((skill) =>
              skillIds.includes(skill.id),
            )),
      );
  }

  const searchValue = query.toLowerCase();

  return users.filter((user) =>
    user.skillCanTeach.name.toLowerCase().includes(searchValue),
  );
};
