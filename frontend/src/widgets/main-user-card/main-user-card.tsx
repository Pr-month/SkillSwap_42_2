import { useMemo /* useState */ } from "react";
import { useNavigate } from "react-router-dom";
import type { IUser } from "../../entities/types";
import { UserCardElement } from "../user-card-element";
import { hasProposal } from "../../shared/lib/proposals";
import { ClockIcon } from "../../assets/img/icons";
import { useLike } from "../../shared/hooks/useLike";

type TMainUserCardProps = {
  user: IUser;
  currentUserId?: string | null;
};

export function MainUserCard({ user, currentUserId }: TMainUserCardProps) {
  const navigate = useNavigate();
  const { isLiked, isLikeDisabled, toggleLike } = useLike({
    targetUserId: user.id,
    currentUserId: currentUserId || null,
    initialIsLiked: user.isLiked,
  });

  const baseLikes = user.likes;
  const likesCount = baseLikes + (isLiked ? 1 : 0);

  const isExchangeProposed = useMemo(() => {
    return hasProposal(currentUserId, user.id);
  }, [currentUserId, user.id]);

  const handleMoreDetailsClick = () => {
    navigate(`/skill/${user.id}`);
  };

  return (
    <UserCardElement
      user={user}
      like={{
        isLiked,
        isLikeDisabled,
        onToggleLike: toggleLike,
        likesCount,
      }}
      actionButton={{
        text: isExchangeProposed ? "Обмен предложен" : "Подробнее",
        type: isExchangeProposed ? "secondary" : "primary",
        icon: isExchangeProposed ? <ClockIcon /> : undefined,
        onClick: handleMoreDetailsClick,
      }}
    />
  );
}
