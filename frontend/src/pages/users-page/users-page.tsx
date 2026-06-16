import { useMemo, useState, type FC } from "react";
import { Sidebar } from "../../widgets/sidebar";
import { useSelector } from "../../features/store";
import style from "./style.module.css";
import { getFilteredUsers } from "../../entities/get-filtered-users";
import { CardsGallery } from "../../widgets/gallery-cards";
import { isNotEmptySelector } from "../../features/filters/filtersSlice";
import { CardsScrollableGallery } from "../../widgets/cards-scrollable-gallery/cards-scrollable-gallery";
import { selectCurrentUser } from "../../features/user/userSlice";

const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
const NOW = Date.now();
const MONTH_AGO = NOW - MONTH_IN_MS;

export const UsersPage: FC = () => {
  const filters = useSelector((state) => state.filters.filters);
  const users = useSelector((state) => state.users.users);
  const hasActiveFilters = useSelector(isNotEmptySelector);

  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const currentUser = useSelector(selectCurrentUser);
  const currentUserId = currentUser ? String(currentUser.id) : null;

  const usersWithoutCurrent = useMemo(() => {
    if (!currentUserId) return users;
    return users.filter((user) => String(user.id) !== currentUserId);
  }, [users, currentUserId]);

  const popularUsers = useMemo(
    () => usersWithoutCurrent.filter((user) => user.likes > 15),
    [usersWithoutCurrent],
  );

  const newUsers = useMemo(
    () =>
      usersWithoutCurrent.filter((user) => {
        const createdTime = new Date(user.createdAt).getTime();
        return !Number.isNaN(createdTime) && createdTime >= MONTH_AGO;
      }),
    [usersWithoutCurrent],
  );

  const filteredUsers = useMemo(
    () => getFilteredUsers(usersWithoutCurrent, filters),
    [filters, usersWithoutCurrent],
  );

  const sortedFilteredUsers = useMemo(() => {
    const copy = filteredUsers.slice();

    copy.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;

      return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
    });

    return copy;
  }, [filteredUsers, sortOrder]);

  return (
    <div className={style["users-page"]}>
      <Sidebar />
      <div className={style["users-page__body"]}>
        {hasActiveFilters ? (
          <CardsGallery
            cards={sortedFilteredUsers}
            title={`Подходящие предложения: ${sortedFilteredUsers.length}`}
            sortable
            sortLabel={
              sortOrder === "desc" ? "Сначала старые" : "Сначала новые"
            }
            sortOnClick={handleToggleSort}
          />
        ) : (
          <>
            <>
              <div className={style.section}>
                <CardsGallery
                  cards={popularUsers}
                  title="Популярное"
                  maxCards={3}
                />
              </div>

              <div className={style.section}>
                <CardsGallery cards={newUsers} title="Новое" maxCards={3} />
              </div>
              <div className={style.section}>
                <CardsScrollableGallery
                  cards={usersWithoutCurrent}
                  title="Рекомендуем"
                  currentUserId={currentUserId}
                />
              </div>
            </>
          </>
        )}
      </div>
    </div>
  );
};
