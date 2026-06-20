import { addElementInArray, excludeElementFromArray } from "./helpers";

const FAVOURITES_STORAGE_KEY = "userFavourites";

type TFavouritesStore = Record<string, number[]>;

function readStore(): TFavouritesStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(FAVOURITES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as TFavouritesStore;
  } catch {
    return {};
  }
}

function writeStore(store: TFavouritesStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(store));
  } catch {
    return;
  }
}

export function getUserFavourites(currentUserId: string): number[] {
  const store = readStore();
  return store[currentUserId] ?? [];
}

export function saveUserFavourites(
  currentUserId: string,
  favourites: number[],
) {
  const store = readStore();
  store[currentUserId] = favourites;
  writeStore(store);
}

export function computeIsLiked(
  currentUserId: string | null | undefined,
  userId: number,
  initialIsLiked: boolean,
): boolean {
  if (!currentUserId) return false;

  const favourites = getUserFavourites(currentUserId);

  return favourites.includes(userId) || initialIsLiked;
}

export function updateUserFavourites(
  currentUserId: string | null | undefined,
  userId: number,
  isLiked: boolean,
): boolean {
  if (!currentUserId) return isLiked;

  const current = getUserFavourites(currentUserId);

  let next: number[];
  if (isLiked) {
    next = excludeElementFromArray(current, userId);
  } else {
    next = addElementInArray(current, userId);
  }

  saveUserFavourites(currentUserId, next);
  return !isLiked;
}
