import type { FC } from "react";
import styles from "./modal-element.module.css";
import { ModalOverlay } from "../modal-overlay/modal-overlay";
import type React from "react";

type TModalElementProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export const ModalElement: FC<TModalElementProps> = ({ children, onClose }) => (
  <>
    <div className={styles.modal}>{children}</div>
    <ModalOverlay onClick={onClose} />
  </>
);
