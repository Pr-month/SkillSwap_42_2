import type { PopupMenuPosition } from "../../ui/popup-menu/popup-menu";

export const updatePosition = (
  menuRef: React.RefObject<HTMLDivElement | null>,
  anchorRef: React.RefObject<HTMLElement | null> | undefined,
  position: PopupMenuPosition,
): void => {
  const menuElement = menuRef.current;
  if (!menuElement) return;

  // Если позиция fixed-top-right, позиционируем относительно viewport
  if (position === "fixed-top-right") {
    menuElement.style.top = "104px";
    menuElement.style.right = "16px";
    menuElement.style.left = "auto";
    return;
  }

  // Для остальных позиций нужен anchorRef
  const anchorElement = anchorRef?.current;
  if (!anchorElement) return;

  const {
    top: anchorTop,
    left: anchorLeft,
    right: anchorRight,
    bottom: anchorBottom,
  } = anchorElement.getBoundingClientRect();
  const menuWidth = menuElement.offsetWidth;
  const menuHeight = menuElement.offsetHeight;

  let top = 0;
  let left = 0;
  let right = 0;

  const gap = 8; // Отступ между якорем и меню
  const edgeOffset = 40; // Отступ от края якоря

  switch (position) {
    case "top-left":
      top = anchorTop - menuHeight - gap;
      left = anchorLeft + edgeOffset;
      break;
    case "top-right":
      top = anchorTop - menuHeight - gap;
      right = anchorRight + edgeOffset;
      break;
    case "bottom-left":
      top = anchorBottom + gap;
      left = anchorLeft + edgeOffset;
      break;
    case "bottom-right":
      top = anchorBottom + gap;
      right = anchorRight + edgeOffset;
      break;
  }

  // Проверка на выход за границы экрана
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (left + menuWidth > viewportWidth) {
    left = viewportWidth - menuWidth - edgeOffset;
  }
  if (left < 0) {
    left = edgeOffset;
  }

  if (right + menuWidth > viewportWidth) {
    right = edgeOffset;
  }

  if (top + menuHeight > viewportHeight) {
    top = anchorTop - menuHeight;
  }
  if (top < 0) {
    top = anchorBottom;
  }

  menuElement.style.top = `${top}px`;
  menuElement.style.left = ["top-right", "bottom-right"].includes(position)
    ? "auto"
    : `${left}px`;
  menuElement.style.right = ["top-left", "bottom-left"].includes(position)
    ? "auto"
    : `${right}px`;
};
