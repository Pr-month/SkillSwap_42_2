import { useRef } from "react";
import type { ChangeEvent, ReactNode } from "react";
import styles from "./avatar-upload.module.css";

type TButtonPlacement =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

type TAvatarUploadProps = {
  imageUrl?: string;
  placeholderIcon?: string;
  buttonIcon?: ReactNode;
  onChange: (file: File | null) => void;
  size?: number;
  disabled?: boolean;
  buttonPlacement?: TButtonPlacement;
  containerClassName?: string;
  avatarClassName?: string;
  buttonClassName?: string;
};

export function AvatarUpload({
  imageUrl,
  placeholderIcon,
  buttonIcon,
  onChange,
  size = 54,
  disabled = false,
  buttonPlacement = "bottom-right",
  containerClassName,
  avatarClassName,
  buttonClassName,
}: TAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onChange(file);
  };

  const handleButtonClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const placementClass =
    buttonPlacement === "bottom-right"
      ? styles.bottomRight
      : buttonPlacement === "bottom-left"
        ? styles.bottomLeft
        : buttonPlacement === "top-right"
          ? styles.topRight
          : styles.topLeft;

  return (
    <div className={`${styles.wrapper} ${containerClassName ?? ""}`}>
      <label
        className={styles.avatarLabel}
        style={{ width: size, height: size }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Аватар пользователя"
            className={`${styles.avatar} ${avatarClassName ?? ""}`}
          />
        ) : (
          <div className={`${styles.placeholder} ${avatarClassName ?? ""}`}>
            {placeholderIcon && (
              <img
                src={placeholderIcon}
                alt=""
                className={styles.placeholderIcon}
              />
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.input}
          onChange={handleFileChange}
          disabled={disabled}
        />

        <button
          type="button"
          className={`${styles.button} ${placementClass} ${buttonClassName ?? ""}`}
          onClick={handleButtonClick}
          disabled={disabled}
        >
          {buttonIcon}
        </button>
      </label>
    </div>
  );
}
