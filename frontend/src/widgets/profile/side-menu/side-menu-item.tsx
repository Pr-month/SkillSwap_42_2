import { NavLink } from "react-router-dom";
import style from "./side-menu.module.css";

export type TProfileSideMenuItemProps = {
  text: string;
  children: React.ReactNode;
  to: string;
};

export const ProfileSideMenuItem = ({
  text,
  children,
  to,
}: TProfileSideMenuItemProps) => {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `${style.item_wrapper} ${isActive ? style.menu_item_selected : ""}`
      }
    >
      <div className={style.menu_item}>
        {children}
        {text}
      </div>
    </NavLink>
  );
};
