import type { IUser } from "../../entities/types";
import styles from "./user-card-element.module.css";
import { getSubcategoryColor } from "../../entities/subcategoryColors";
import { Button } from "../../shared/ui/button/button";
import { LikeButton } from "../../shared/ui/like-button";
import { useSelector } from "../../features/store";
import type React from "react";
import avatarPlaceholder from "../../assets/icons/avatar-placeholder.svg";

type TActionButton = {
  text: string;
  type?: "primary" | "secondary" | "tertiary";
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

export type TLikeInfo = {
  isLiked: boolean;
  isLikeDisabled: boolean;
  onToggleLike: () => void;
  likesCount: number;
};

// Этот компонент отображает карточку пользователя с информацией и навыками
type TUserCardElementProps = {
  user: IUser;
  like?: TLikeInfo;
  withDescription?: boolean;
  onMoreDetailsClick?: () => void;
  actionButton?: TActionButton;
};

export function UserCardElement({
  user,
  like,
  onMoreDetailsClick,
  withDescription = false,
  actionButton,
}: TUserCardElementProps) {
  const { categories } = useSelector((store) => store.categories);
  const {
    name,
    location,
    age,
    avatarUrl,
    skillCanTeach,
    subcategoriesWantToLearn,
    description,
  } = user;

  // Определяем видимые подкатегории для отображения и количество скрытых подкатегорий
  const visibleSubcategories = subcategoriesWantToLearn.slice(0, 2);
  const hiddenCount =
    subcategoriesWantToLearn.length - visibleSubcategories.length;
  const avatarSrc = avatarUrl || avatarPlaceholder;

  return (
    <article className={styles.card}>
      <div className={styles.userBox}>
        <img className={styles.avatar} src={avatarSrc} alt={name} />

        {/* Блок с аватаром, именем и лайками */}
        <div className={styles.userInfo}>
          <div className={styles.userHeader}>
            <div className={styles.likeWrapper}>
              {like && (
                <>
                  <span className={styles.likeCount}>{like.likesCount}</span>
                  <LikeButton
                    isLiked={like.isLiked}
                    isLikeDisabled={like.isLikeDisabled}
                    toggleLike={like.onToggleLike}
                  />
                </>
              )}
            </div>

            <div className={styles.userText}>
              <h3 className={styles.name}>{name}</h3>
              <p className={styles.meta}>
                <span>{location}</span>
                <span>, </span>
                <span>{age}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {withDescription && <p>{description}</p>}

      {/* Секция "Может научить" с отображением навыка, которым может поделиться пользователь */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Может научить:</p>
        <div className={styles.chips}>
          <span
            className={styles.chip}
            style={{
              backgroundColor: getSubcategoryColor(
                categories,
                skillCanTeach.subCategoryId,
              ),
            }}
          >
            {skillCanTeach.name}
          </span>
        </div>
      </div>

      {/* Секция "Хочет научиться" с отображением подкатегорий и индикацией скрытых элементов */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Хочет научиться:</p>
        <div className={styles.chips}>
          {visibleSubcategories.map((subcategory) => {
            const color = getSubcategoryColor(categories, subcategory.id);

            return (
              <span
                key={subcategory.id}
                className={styles.chip}
                style={{ backgroundColor: color }}
              >
                <span className={styles.chipText}>{subcategory.name}</span>
              </span>
            );
          })}

          {hiddenCount > 0 && (
            <span className={styles.chipMore}>+{hiddenCount}</span>
          )}
        </div>
      </div>

      {/* Кнопка для навигации к модальному окну с подробностями */}
      {actionButton ? (
        <Button
          type={actionButton.type ?? "primary"}
          fullWidth
          onClick={actionButton.onClick}
          disabled={actionButton.disabled}
          icon={actionButton.icon}
        >
          {actionButton.text}
        </Button>
      ) : (
        onMoreDetailsClick && (
          <Button type="primary" fullWidth onClick={onMoreDetailsClick}>
            Подробнее
          </Button>
        )
      )}
    </article>
  );
}
