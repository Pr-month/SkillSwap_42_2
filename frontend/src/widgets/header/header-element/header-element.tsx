import styles from "./header-element.module.css";
import type { FC } from "react";
import { Logo } from "../../../shared/ui/logo";
import {
  ArrowIcon,
  BellIcon,
  HeartIcon,
  MoonIcon,
} from "../../../assets/img/icons";
import { SearchInput } from "../../../shared/ui/input";
import { Button } from "../../../shared/ui/button/button";
import { TextLink } from "../../../shared/ui/text-link";
import type { IApiUser } from "../../../entities/types";
import { useNavigate } from "react-router-dom";
import avatarPlaceholder from "../../../assets/icons/avatar-placeholder.svg";

type THeaderElementProps = {
  isFilterEnabled: boolean;
  handleSkillsClick?: () => void;
  user?: IApiUser | null;
  onLogin?: () => void;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  ref?: React.Ref<HTMLElement>;
};

export const HeaderElement: FC<THeaderElementProps> = ({
  isFilterEnabled,
  handleSkillsClick,
  user,
  ref,
  onLogin = () => console.log("Вход"),
  onProfileClick = () => console.log("Профиль"),
  onNotificationsClick = () => console.log("Уведомления"),
}) => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/register/step1");
  };
  const avatarSrc =
    user?.avatarUrl && user?.avatarUrl !== "no avatar"
      ? user?.avatarUrl
      : avatarPlaceholder;
  return (
    <header ref={ref} className={styles.header}>
      <nav className={styles.menu}>
        <Logo />
        <ul className={styles.list}>
          <li>
            <TextLink>О проекте</TextLink>
          </li>
          <li>
            <TextLink onClick={handleSkillsClick}>
              {"Все навыки "}
              <ArrowIcon initialRotation={0} opened={false} />
            </TextLink>
          </li>
        </ul>
        {!isFilterEnabled && (
          <div className={styles.input}>
            <SearchInput placeholder="Искать навык" />
          </div>
        )}

        <div className={styles.right_section}>
          <button className={styles.icon_button}>
            <MoonIcon />
          </button>

          {user ? (
            <>
              <button
                className={styles.icon_button}
                onClick={onNotificationsClick}
              >
                <BellIcon />
              </button>
              <button
                className={styles.icon_button}
                onClick={() => navigate("/profile/favourites")}
                aria-label="Избранное"
              >
                <HeartIcon />
              </button>

              <div
                className={styles.user_info}
                onClick={onProfileClick}
                role="button"
                tabIndex={0}
              >
                <span className={styles.user_name}>{user.name}</span>
                <img
                  src={avatarSrc}
                  alt={`Аватар ${user.name}`}
                  className={styles.user_avatar}
                />
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={onLogin}
                type={"secondary"}
                className={styles.login_button}
              >
                Войти
              </Button>
              <Button
                onClick={handleRegisterClick}
                className={styles.register_button}
              >
                {" "}
                {/* удалить handleRegisterClick и оставить () => {} в случае если этот элемент пока не нужен*/}
                Зарегистрироваться
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
