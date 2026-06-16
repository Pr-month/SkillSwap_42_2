import { Button } from "../button/button";
import style from "./like-button.module.css";

export type TLikeButtonProps = {
  isLiked: boolean;
  isLikeDisabled: boolean;
  toggleLike: () => void;
};

export const LikeButton = ({
  isLiked,
  isLikeDisabled,
  toggleLike,
}: TLikeButtonProps) => {
  return (
    <Button
      type="tertiary"
      onClick={toggleLike}
      aria-pressed={isLiked}
      aria-label={isLiked ? "Убрать из избранного" : "Добавить в избранное"}
      disabled={isLikeDisabled}
      className={style.likeButton}
    >
      <svg
        width="20"
        height="20"
        viewBox="-1 -1 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 17C6 15 2 11.5 2 7.2C2 4.4 4.3 2 7.1 2C8.8 2 10.2 2.8 11 4C11.8 2.8 13.2 2 14.9 2C17.7 2 20 4.4 20 7.2C20 11.6 16 15 12 17C11.5 17.2 10.5 17.2 10 17Z"
          fill={isLiked ? "var(--accent-color)" : "var(--card-input-color)"}
          stroke={isLiked ? "var(--accent-color)" : "var(--border-color)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  );
};
