import styles from "./header-menu-avatar-content.module.css";
import { LogoutIcon } from "../../assets/img/icons";
import { Button } from "../../shared/ui/button/button";
import { useDispatch } from "../../features/store";
import { logout } from "../../features/user/userSlice";
import { useNavigate } from "react-router-dom";

export const HeaderMenuAvatarContent = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
    onClose();
  };

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  return (
    <ul className={styles.menuList}>
      <li className={styles.menuItemButton}>
        <Button
          type="tertiary"
          onClick={handleProfileClick}
          className={styles.menuItem}
        >
          Личный кабинет
        </Button>
      </li>
      <li className={styles.menuItemButton}>
        <Button
          type="tertiary"
          onClick={handleLogout}
          className={styles.menuItem}
        >
          Выйти из аккаунта
          <LogoutIcon />
        </Button>
      </li>
    </ul>
  );
};
