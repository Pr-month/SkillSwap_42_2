import { AvatarUpload } from "../../shared/ui/avatar-upload/avatar-upload";
import PlaceholderIcon from "../../assets/icons/avatar-placeholder.svg";
import PlusIcon from "../../assets/icons/avatar-plus.svg";

type RegistrationAvatarFieldProps = {
  avatarUrl?: string;
  onAvatarChange: (file: File | null) => void;
};

export function RegistrationAvatarField({
  avatarUrl,
  onAvatarChange,
}: RegistrationAvatarFieldProps) {
  return (
    <AvatarUpload
      size={54}
      imageUrl={avatarUrl}
      placeholderIcon={PlaceholderIcon}
      buttonIcon={<img src={PlusIcon} alt="" width={16} height={16} />}
      buttonPlacement="bottom-right"
      onChange={onAvatarChange}
    />
  );
}
