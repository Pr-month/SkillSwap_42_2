import { ProfileSideMenu } from "../../widgets/profile";
import { Outlet } from "react-router-dom";

import styles from "./profile.module.css";

export const Profile = () => {
  return (
    <section className={styles.page}>
      <div className={styles.side_menu}>
        <ProfileSideMenu />
      </div>
      <Outlet />
    </section>
  );
};
