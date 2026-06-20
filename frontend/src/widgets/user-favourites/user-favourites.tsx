import { useMemo } from "react";
import { useSelector } from "../../features/store";
import { usersSelector } from "../../features/users/usersSlice";
import { selectCurrentUserFavourites } from "../../features/user/userSlice";
import { CardsGallery } from "../gallery-cards";
import type { IUser } from "../../entities/types";
import { Button } from "../../shared/ui/button/button";
import { Link } from "react-router-dom";
import styles from "./user-favourites.module.css";

export function UserFavourites() {
  const favourites = useSelector(selectCurrentUserFavourites);
  const allUsers = useSelector(usersSelector);
  const favouriteUsers = useMemo(() => {
    return favourites.reduce((currentArray, id) => {
      const user = allUsers.find((user) => user.id == id);
      if (user) {
        currentArray.push(user);
      }
      return currentArray;
    }, [] as IUser[]);
  }, [allUsers, favourites]);

  return favouriteUsers.length === 0 ? (
    <div className={styles.page__no_users}>
      <h1 className={styles.headline}>Избранные пользователи не найдены</h1>
      <Link to="/">
        <Button>Вернуться в каталог</Button>
      </Link>
    </div>
  ) : (
    <CardsGallery title={"Избранное"} cards={favouriteUsers}></CardsGallery>
  );
}
