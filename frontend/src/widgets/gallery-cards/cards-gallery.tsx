import { useState } from "react";
import type { IUser } from "../../entities/types";
import { Button } from "../../shared/ui/button/button.tsx";
import { MainUserCard } from "../main-user-card/main-user-card.tsx";
import style from "./cards-gallery.module.css";
import { SortIcon, RightIcon } from "../../assets/img/icons";
import { useSelector } from "../../features/store";
import { selectCurrentUser } from "../../features/user/userSlice.ts";

export type CardsGalleryPros = {
  title: string;
  cards: IUser[];
  maxCards?: number;
  sortable?: boolean;
  sortOnClick?: () => void;
  sortLabel?: string;
};

export const CardsGallery = ({
  title,
  cards,
  maxCards,
  sortable,
  sortOnClick,
  sortLabel,
}: CardsGalleryPros) => {
  const [expanded, setExpanded] = useState(false);

  const shouldLimit = maxCards !== undefined && maxCards > 0;
  const displayedCards =
    shouldLimit && !expanded ? cards.slice(0, maxCards) : cards;
  const hasMore = shouldLimit && cards.length > maxCards;

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };

  const currentUser = useSelector(selectCurrentUser);
  const currentUserId = currentUser ? String(currentUser.id) : null;

  return (
    <div>
      <div className={style.card_gallery_header}>
        <h2 className={style.card_gallery_header_title}>{title}</h2>
        <div className={style.card_gallery_actions}>
          {hasMore && (
            <Button type="tertiary" onClick={toggleExpanded}>
              <div className={style.card_gallery_button}>
                {expanded ? "Свернуть" : "Смотреть все"}
                <RightIcon />
              </div>
            </Button>
          )}

          {sortable && (
            <Button type="tertiary" onClick={sortOnClick || (() => {})}>
              <div className={style.card_gallery_button}>
                <SortIcon />
                {sortLabel ?? "Сначала новые"}
              </div>
            </Button>
          )}
        </div>
      </div>
      <div className={style.card_gallery_main}>
        {displayedCards.map((user) => (
          <MainUserCard
            key={`${currentUserId ?? "guest"}-${user.id}`}
            user={user}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
};
