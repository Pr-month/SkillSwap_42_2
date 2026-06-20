import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";

const AVATAR_KEY = "user-avatar" as const;

export function useAvatar() {
  const avatarFile = useLiveQuery<File | null>(async () => {
    const record = await db.avatars.get(AVATAR_KEY);
    return record?.blob ?? null;
  }, []);

  const setAvatar = async (file: File | null) => {
    if (!file) {
      return;
    }

    await db.avatars.put({
      key: AVATAR_KEY,
      blob: file,
      createdAt: new Date(),
    });
  };

  return {
    avatarFile,
    setAvatar,
    hasAvatar: !!avatarFile,
  };
}
