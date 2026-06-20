import type { TProfileSideMenuItemProps } from "./side-menu-item";
import {
  HeartIcon,
  UserIcon,
  SkillIcon,
  MessageIcon,
  MessageTextIcon,
} from "../../../assets/img/icons";

export const sideMenuItems: Pick<
  TProfileSideMenuItemProps,
  "text" | "children" | "to"
>[] = [
  { text: "Заявки", children: <MessageIcon />, to: "/profile/requests" },
  { text: "Мои обмены", children: <MessageTextIcon />, to: "/profile/trades" },
  { text: "Избранное", children: <HeartIcon />, to: "/profile/favourites" },
  { text: "Мои навыки", children: <SkillIcon />, to: "/profile/skills" },
  { text: "Личные данные", children: <UserIcon />, to: "/profile" },
];
