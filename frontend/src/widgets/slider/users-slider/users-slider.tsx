import {
  Splide,
  SplideSlide,
  // @ts-expect-error - библиотека имеет проблемы с типами
} from "@splidejs/react-splide";
import type { Options } from "@splidejs/splide";
import type { IUser } from "../../../entities/types";
import { MainUserCard } from "../../main-user-card/main-user-card";
import { USER_OPTIONS } from "../constants/sliderOptions";

import "@splidejs/splide/dist/css/splide.min.css";
import styles from "./users-slider.module.css";

type TUsersSliderProps = {
  users: IUser[];
  options?: Options;
};

export const UsersSlider: React.FC<TUsersSliderProps> = ({
  users,
  options = {},
}) => {
  if (!users || users.length === 0) {
    return <div className={styles.noUsers}>Нет пользователей</div>;
  }

  return (
    <Splide
      options={{ ...USER_OPTIONS, ...options }}
      aria-label="Пользователи"
      className={styles.splide}
    >
      {users.map((user) => (
        <SplideSlide key={user.id}>
          <MainUserCard user={user} />
        </SplideSlide>
      ))}
    </Splide>
  );
};
