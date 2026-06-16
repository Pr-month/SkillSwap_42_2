import type { FC } from "react";
import styles from "./modal-confirm.module.css";
import { Button } from "../../shared/ui/button/button";

type TModalConfirmProps = {
  image: string;
  title: string;
  text: string;
  buttonText: string;
  onClose: () => void;
};

export const ModalConfirm: FC<TModalConfirmProps> = ({
  image,
  title,
  text,
  buttonText,
  onClose,
}) => (
  <>
    <img src={image} className={styles.image} />
    <h2 className={styles.title}>{title}</h2>
    <p className={styles.content}>{text}</p>
    <Button fullWidth onClick={onClose}>
      {buttonText}
    </Button>
  </>
);
