import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "../../features/store";
import {
  selectCurrentUserFavourites,
  setCurrentUserFavourites,
} from "../../features/user/userSlice";
import { addElementInArray, excludeElementFromArray } from "../lib/helpers";
import { computeIsLiked, updateUserFavourites } from "../lib/favourites";

type TUseLikeParams = {
  targetUserId: number;
  currentUserId: string | null;
  initialIsLiked?: boolean;
};

export const useLike = ({
  targetUserId,
  currentUserId,
  initialIsLiked = false,
}: TUseLikeParams) => {
  const dispatch = useDispatch();
  const favourites = useSelector(selectCurrentUserFavourites);

  const isAuthorized = Boolean(currentUserId);

  const [isLiked, setIsLiked] = useState(() =>
    computeIsLiked(currentUserId, targetUserId, initialIsLiked),
  );

  const toggleLike = useCallback(() => {
    if (!currentUserId) return;

    const newIsLiked = updateUserFavourites(
      currentUserId,
      targetUserId,
      isLiked,
    );

    dispatch(
      setCurrentUserFavourites(
        isLiked
          ? excludeElementFromArray(favourites, targetUserId)
          : addElementInArray(favourites, targetUserId),
      ),
    );

    setIsLiked(newIsLiked);
  }, [currentUserId, targetUserId, isLiked, favourites, dispatch]);

  return {
    isLiked,
    toggleLike,
    isLikeDisabled: !isAuthorized,
  };
};
