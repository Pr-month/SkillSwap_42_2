import { RegisterHeader } from "../../widgets/register-step-header";
import { UserSkillsRegForm } from "../../widgets/user-skills-reg-form";
import { RegisterStepInfo } from "../../widgets/register-step-info";
import SchoolBoard from "../../assets/icons/school-board.svg";
import styles from "./register-step3.module.css";
import { useEffect, useState } from "react";
import { Modal } from "../../shared/ui/modal";
import { useDispatch, useSelector } from "../../features/store";
import { ProposalWidgets } from "../../widgets/post-reg-proposal-widgets/post-reg-proposal-widgets";
import { useTempSkillImages } from "../../shared/hooks/useTempSkillImages";
import { useRegistrationAvatar } from "../../shared/hooks/useRegistrationAvatar";
import {
  clearError,
  selectAuthLoading,
  selectRegisterError,
} from "../../features/user/userSlice";
import { registerUser } from "../../features/user/actions";
import { Loader } from "../../shared/ui/loader";
import { ModalConfirm } from "../../widgets/modal-confirm/modal-confirm";
import Done from "../../assets/icons/done.svg";
import { useNavigate } from "react-router-dom";
export const RegisterStep3Page = () => {
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isRegisterStatusOpen, setIsRegisterStatusOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoadingRegister = useSelector(selectAuthLoading);
  const isRegisterError = useSelector(selectRegisterError);
  const { reg } = useSelector((store) => store.forms);
  const { avatarFile, commitAvatar } = useRegistrationAvatar();
  const { tempImages, commitImages } = useTempSkillImages();

  useEffect(() => {
    if (isRegisterError) {
      dispatch(clearError());
      navigate("/error");
    }
  }, [isRegisterError, navigate, dispatch]);

  useEffect(() => {
    if (!reg.email) {
      navigate("/register/step1");
    }
  }, [navigate, reg.email]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <RegisterHeader />
      </div>

      <div className={styles.container}>
        <div className={styles.left}>
          <UserSkillsRegForm setIsProposalOpen={setIsProposalOpen} />
        </div>

        <div className={styles.right}>
          <RegisterStepInfo
            image={SchoolBoard}
            title="Укажите, чем вы готовы поделиться"
            subtitle="Так другие люди смогут увидеть ваши предложения и предложить вам обмен!"
          />
        </div>
      </div>
      {isProposalOpen && (
        <Modal onClose={() => setIsProposalOpen(false)}>
          <ProposalWidgets
            title="Ваше предложение"
            skillCanTeach={{
              name: reg.skillCanTeach.name!,
              fullDescription: reg.skillCanTeach.description!,
              categoryId: reg.skillCanTeach.categoryId!,
              subCategoryId: reg.skillCanTeach.subcategoryId!,
            }}
            onClickEdit={() => setIsProposalOpen(false)}
            onClickReady={() => {
              setIsProposalOpen(false);
              setIsRegisterStatusOpen(true);
              dispatch(
                registerUser({
                  form: reg,
                  avatar: avatarFile as File,
                  images: tempImages,
                }),
              );
              commitAvatar();
              commitImages();
            }}
          />
        </Modal>
      )}
      {isRegisterStatusOpen && (
        <Modal onClose={() => setIsRegisterStatusOpen(false)}>
          {isLoadingRegister ? (
            <Loader />
          ) : (
            <ModalConfirm
              image={Done}
              title="Ваше предложение создано"
              text="Теперь вы можете предложить обмен"
              buttonText="Готово"
              onClose={() => setIsRegisterStatusOpen(false)}
            ></ModalConfirm>
          )}
        </Modal>
      )}
    </div>
  );
};
