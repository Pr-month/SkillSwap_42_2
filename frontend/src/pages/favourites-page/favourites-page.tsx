import styles from "./favourites-page.module.css";
import { UserFavourites } from "../../widgets/user-favourites/user-favourites";

export const FavouritesPage = () => {
  return (
    <section className={styles.page}>
      <UserFavourites />
    </section>
  );
};
