import { useState, useEffect } from "react";
import { db } from "../../db/db";

const TEMP_KEY = "registration-temp-avatar" as const;
const PERMANENT_KEY = "user-avatar" as const;

export function useRegistrationAvatar() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  // Загружаем временную аватарку при старте
  useEffect(() => {
    (async () => {
      const record = await db.tempRegistrationAvatars.get(TEMP_KEY);
      if (record?.blob) {
        const url = URL.createObjectURL(record.blob);
        setAvatarFile(record.blob);
        setPreviewUrl(url);
      }
    })();
  }, []);

  const setAvatar = async (file: File | null) => {
    await db.tempRegistrationAvatars.where("key").equals(TEMP_KEY).delete();

    if (!file) {
      setAvatarFile(null);
      setPreviewUrl(undefined);
      return;
    }

    await db.tempRegistrationAvatars.put({
      key: TEMP_KEY,
      blob: file,
      createdAt: new Date(),
    });

    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setPreviewUrl(url);
  };

  const commitAvatar = async () => {
    const tempRecord = await db.tempRegistrationAvatars.get(TEMP_KEY);
    await db.avatars.delete(PERMANENT_KEY);
    if (tempRecord?.blob) {
      await db.avatars.put({
        key: PERMANENT_KEY,
        blob: tempRecord.blob,
        createdAt: new Date(),
      });
      await db.tempRegistrationAvatars.delete(TEMP_KEY);
    }
  };

  const discardAvatar = async () => {
    await db.tempRegistrationAvatars.delete(TEMP_KEY);
    setAvatarFile(null);
    setPreviewUrl(undefined);
  };

  // Очистка blob-URL при размонтировании
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return {
    avatarFile, // File | null
    previewUrl, // для <img>
    setAvatar, // выбрать/изменить
    commitAvatar, // вызвать на финальном submit — переносит в постоянную
    discardAvatar, // вызвать при отмене регистрации
    hasAvatar: !!avatarFile,
  };
}
