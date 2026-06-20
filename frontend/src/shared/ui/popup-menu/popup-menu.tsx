import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./popup-menu.module.css";
import { updatePosition } from "../../lib/helpers/updatePosition";

export type PopupMenuPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "fixed-top-right";

export type PopupMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: PopupMenuPosition;
  anchorRef?: React.RefObject<HTMLElement | null>;
};

export const PopupMenu = ({
  isOpen,
  onClose,
  children,
  position = "bottom-left",
  anchorRef,
}: PopupMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!menuRef.current || menuRef.current.contains(target)) return;

      // Для fixed позиции проверяем только меню
      if (position === "fixed-top-right") {
        onClose();
        return;
      }

      // Для остальных позиций проверяем и якорь
      if (anchorRef?.current && !anchorRef.current.contains(target)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, anchorRef, position]);

  useEffect(() => {
    if (!isOpen) return;

    const handleUpdatePosition = () => {
      updatePosition(menuRef, anchorRef, position);
    };

    handleUpdatePosition();
    window.addEventListener("resize", handleUpdatePosition);
    window.addEventListener("scroll", handleUpdatePosition, true);

    return () => {
      window.removeEventListener("resize", handleUpdatePosition);
      window.removeEventListener("scroll", handleUpdatePosition, true);
    };
  }, [isOpen, position, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <div ref={menuRef} className={styles.popupMenu}>
      {children}
    </div>,
    document.body,
  );
};
