import styles from "./notifications-menu.module.css";
import { LightbulbIcon } from "../../assets/img/icons";
import { Button } from "../../shared/ui/button/button";
import { getSelectedUsers } from "../../shared/lib/proposals";
import { useSelector } from "../../features/store";
import { selectCurrentUser } from "../../features/user/userSlice";
import { usersSelector } from "../../features/users/usersSlice";
import type { IUser } from "../../entities/types";

type Notification = {
  id: number;
  title: string;
  description: string;
  date: string;
  type: "new" | "viewed";
};

const getProposalNotifications = (users: IUser[]): Notification[] => {
  if (!users || users.length === 0) {
    return [];
  }

  const notifications: Notification[] = [];

  const newProposals = users.slice(0, 2);
  newProposals.forEach((user) => {
    const gender = user.gender === "female" ? "она" : "он";
    notifications.push({
      id: Math.random(),
      title: `Вы предложили обмен пользователю ${user.name}`,
      description: `Дождитесь, когда ${gender} примет предложение`,
      date: "сегодня",
      type: "new",
    });
  });

  if (users.length > 2) {
    const viewedUsers = users.slice(2, 4);
    viewedUsers.forEach((user) => {
      const gender = user.gender === "female" ? "она" : "он";
      notifications.push({
        id: Math.random(),
        title: `Вы предложили обмен пользователю ${user.name}`,
        description: `Дождитесь, когда ${gender} примет предложение`,
        date: "вчера",
        type: "viewed",
      });
    });
  }

  return notifications;
};

type NotificationItemProps = {
  notification: Notification;
  showButton?: boolean;
  isViewed?: boolean;
};

const NotificationItem = ({
  notification,
  showButton = false,
  isViewed = false,
}: NotificationItemProps) => {
  return (
    <div className={`${styles.notification} ${isViewed ? styles.viewed : ""}`}>
      <div className={styles.notificationContent}>
        <div className={styles.notificationHeader}>
          <div className={styles.notificationIcon}>
            <LightbulbIcon />
          </div>
          <div className={styles.notificationText}>
            <div className={styles.notificationTitle}>{notification.title}</div>
            <div className={styles.notificationDescription}>
              {notification.description}
            </div>
          </div>
          <div className={styles.notificationDate}>{notification.date}</div>
        </div>
        {showButton && (
          <Button
            onClick={() => {}}
            type="primary"
            className={styles.notificationButton}
          >
            Перейти
          </Button>
        )}
      </div>
    </div>
  );
};

export const NotificationsMenu = () => {
  const currentUser = useSelector(selectCurrentUser);
  const users = useSelector(usersSelector);

  if (!currentUser || !users) {
    return null;
  }
  const userId = currentUser.id.toString();
  const selectedUsers = getSelectedUsers(userId, users);
  const allNotifications = getProposalNotifications(selectedUsers);
  const newNotifications = allNotifications.filter(
    (item) => item.type === "new",
  );
  const viewedNotifications = allNotifications.filter(
    (item) => item.type === "viewed",
  );

  return (
    <div className={styles.notificationsMenu}>
      <div className={styles.header}>
        <h3 className={styles.title}>Новые уведомления</h3>
        <button className={styles.link} onClick={() => {}}>
          Прочитать все
        </button>
      </div>

      {newNotifications.length === 0 ? (
        <div className={styles.section}>Нет уведомлений</div>
      ) : (
        <div className={styles.section}>
          {newNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              showButton
            />
          ))}
        </div>
      )}

      {viewedNotifications.length > 0 && (
        <div className={styles.viewedSection}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.title}>Просмотренные</h4>
            <button className={styles.link} onClick={() => {}}>
              Очистить
            </button>
          </div>
          {viewedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isViewed
            />
          ))}
        </div>
      )}
    </div>
  );
};
