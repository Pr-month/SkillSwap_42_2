import style from "./skill-page.module.css";
import { SkillInfo } from "../../widgets/skill-info";
import { SkillUserCard } from "../../widgets/skill-user-card";
import { UsersSlider } from "../../widgets/slider/users-slider/users-slider";
import { userByIdSelector } from "../../features/users/usersSlice";
import { useSelector } from "../../features/store";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";

import { Modal } from "../../shared/ui/modal/modal";
import { ModalConfirm } from "../../widgets/modal-confirm/modal-confirm";
import Bell from "../../assets/icons/bell.svg";

export const SkillPage = () => {
  const { id } = useParams();
  const userId = Number(id);

  const user = useSelector((store) => userByIdSelector(store, userId));

  const allUsers = useSelector((store) => store.users.users);

  const usersWithSameSkill = useMemo(
    () =>
      user?.skillCanTeach?.id
        ? allUsers.filter((u) => u.skillCanTeach?.id === user.skillCanTeach.id)
        : [],
    [allUsers, user],
  );

  const similarUsers = useMemo(() => {
    return usersWithSameSkill.filter((u) => u.id !== userId);
  }, [usersWithSameSkill, userId]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  return (
    <div className={style.page}>
      <div className={style.info}>
        <SkillUserCard user={user} />
        <SkillInfo
          skill={user.skillCanTeach}
          images={user.images}
          ownerUserId={user.id}
          onProposalConfirmOpen={() => setConfirmOpen(true)}
        />
      </div>
      <div>
        <p className={style.similar_offers_title}>Похожие предложения</p>
        {similarUsers.length > 0 ? (
          <UsersSlider users={similarUsers} />
        ) : (
          <p>Нет пользователей с таким же навыком</p>
        )}
      </div>

      {confirmOpen && (
        <Modal onClose={() => setConfirmOpen(false)}>
          <ModalConfirm
            image={Bell}
            title="Вы предложили обмен"
            text="Теперь дождитесь подтверждения. Вам придёт уведомление"
            buttonText="Готово"
            onClose={() => setConfirmOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};
