import { type FC } from "react";
import { HeaderElement } from "./header-element/header-element";
import { useSelector } from "../../features/store";
import { selectCurrentUser } from "../../features/user/userSlice";
import { isNotEmptyWithoutSearchSelector } from "../../features/filters/filtersSlice";
import { useNavigate } from "react-router-dom";

type THeaderProps = {
  handleSkillsClick?: () => void;
  ref?: React.Ref<HTMLElement>;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
};

export const Header: FC<THeaderProps> = ({
  handleSkillsClick,
  ref,
  onProfileClick,
  onNotificationsClick,
}) => {
  const isFilterEnabled = useSelector(isNotEmptyWithoutSearchSelector);
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <HeaderElement
      ref={ref}
      isFilterEnabled={isFilterEnabled}
      handleSkillsClick={handleSkillsClick}
      user={currentUser}
      onLogin={handleLogin}
      onProfileClick={onProfileClick}
      onNotificationsClick={onNotificationsClick}
    />
  );
};
