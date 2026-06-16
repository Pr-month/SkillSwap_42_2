import { UserCardElement } from "../user-card-element";
import type { IUser } from "../../entities/types";

export type TSkillUserCardProps = {
  user: IUser;
};

export const SkillUserCard = ({ user }: TSkillUserCardProps) => {
  return <UserCardElement user={user} withDescription={true} />;
};
