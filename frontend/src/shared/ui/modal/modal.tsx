import ReactDOM from "react-dom";
import { ModalElement } from "./modal-element/modal-element";
import React, { useEffect, type FC } from "react";

const modalRoot = document.getElementById("modals");

type TModalProps = {
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal: FC<TModalProps> = ({ children, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <ModalElement onClose={onClose}>{children}</ModalElement>,
    modalRoot as HTMLDivElement,
  );
};
