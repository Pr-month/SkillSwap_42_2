import { AvatarUpload } from "../../../shared/ui/avatar-upload/avatar-upload";
import EditIcon from "../../../assets/icons/edit-image.svg";
import styles from "./avatar.module.css";
import PlaceholderIcom from "../../../assets/icons/avatar-placeholder.svg";
import { useSelector } from "../../../features/store";
import { selectCurrentUser } from "../../../features/user/userSlice";
import avatarPlaceholder from "../../../assets/icons/avatar-placeholder.svg";

type ProfileAvatarFieldProps = {
  avatarUrl?: string;
  onAvatarChange: (file: File | null) => void;
};

export function ProfileAvatar({
  avatarUrl,
  onAvatarChange,
}: ProfileAvatarFieldProps) {
  const currentUser = useSelector(selectCurrentUser);
  const avatarSrc = avatarUrl
    ? avatarUrl
    : currentUser?.avatarUrl && currentUser?.avatarUrl !== "no avatar"
      ? currentUser?.avatarUrl
      : avatarPlaceholder;

  return (
    <AvatarUpload
      size={244}
      imageUrl={avatarSrc}
      placeholderIcon={PlaceholderIcom}
      buttonIcon={
        <img src={EditIcon} alt="" className={styles.profileAvatarIcon} />
      }
      buttonPlacement="bottom-right"
      onChange={onAvatarChange}
      buttonClassName={styles.profileAvatarButton}
    />
  );
}
