import type { TSkill } from "../../entities/types";
import { ImagesSlider } from "../slider/images-slider/images-slider";
import { Button } from "../../shared/ui/button/button";
import { LikeButton } from "../../shared/ui/like-button";
import { ShareIcon, MoreIcon, ClockIcon } from "../../assets/img/icons";
import style from "./skill-info.module.css";

import { categoriesSelector } from "../../features/categories/categoriesSlice";
import { useSelector } from "../../features/store";
import { selectCurrentUser } from "../../features/user/userSlice";
import { addProposal, hasProposal } from "../../shared/lib/proposals";
import { useLike } from "../../shared/hooks/useLike";
import { useLocation, useNavigate } from "react-router-dom";

export type TSkillInfoProps = {
  skill: TSkill;
  images: string[];
  ownerUserId: number;
  onProposalConfirmOpen?: () => void;
};

export const SkillInfo = ({
  skill,
  images,
  ownerUserId,
  onProposalConfirmOpen,
}: TSkillInfoProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useSelector(categoriesSelector);

  const currentUser = useSelector(selectCurrentUser);
  const currentUserId = currentUser ? String(currentUser.id) : null;

  const categoryItem = categories.find((item) => item.id === skill.categoryId);
  const subcategoryItem = categoryItem?.subcategories.find(
    (item) => item.id == skill.subCategoryId,
  );

  const isExchangeProposed = hasProposal(currentUserId, ownerUserId);

  const { isLiked, isLikeDisabled, toggleLike } = useLike({
    targetUserId: ownerUserId,
    currentUserId,
  });

  const handleProposeExchange = () => {
    if (isExchangeProposed) return;

    if (currentUserId) {
      addProposal(currentUserId, ownerUserId);
      onProposalConfirmOpen?.();
    } else {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }
  };

  return (
    <div className={style.skill_info_section}>
      <div className={style.icon_buttons}>
        <LikeButton
          isLiked={isLiked}
          isLikeDisabled={isLikeDisabled}
          toggleLike={toggleLike}
        />
        <Button
          type="tertiary"
          onClick={() => {}}
          className={style.icon_button}
        >
          <ShareIcon />
        </Button>
        <Button
          type="tertiary"
          onClick={() => {}}
          className={style.icon_button}
        >
          <MoreIcon />
        </Button>
      </div>

      <div className={style.content}>
        <div className={style.text_content}>
          <h1 className={style.title}>{skill.name}</h1>
          <p className={style.caption}>
            {categoryItem ? categoryItem.name : ""} /{" "}
            {subcategoryItem ? subcategoryItem.name : ""}
          </p>
          <p>{skill.fullDescription}</p>
          <Button
            type={isExchangeProposed ? "secondary" : "primary"}
            onClick={handleProposeExchange}
            className={style.swap_button}
            fullWidth
            icon={isExchangeProposed ? <ClockIcon /> : undefined}
          >
            {isExchangeProposed ? "Обмен предложен" : "Предложить обмен"}
          </Button>
        </div>
        <ImagesSlider images={images} />
      </div>
    </div>
  );
};
