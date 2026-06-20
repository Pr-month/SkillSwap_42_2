import { ProfileSideMenuItem } from "./side-menu-item";
import { sideMenuItems } from "./constants";
import style from "./side-menu.module.css";

export const ProfileSideMenu = () => {
  return (
    <nav className={style.menu}>
      {sideMenuItems.map((item) => (
        <ProfileSideMenuItem to={item.to} text={item.text} key={item.text}>
          {item.children}
        </ProfileSideMenuItem>
      ))}
    </nav>
  );
};
