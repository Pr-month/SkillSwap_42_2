import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import type { IUploadedFile } from "../../entities/types";

export function useTempSkillImages() {
  const tempImages = useLiveQuery<IUploadedFile[]>(
    () =>
      db.tempSkillImages
        .orderBy("createdAt")
        .toArray()
        .then((arr) =>
          arr.map((r) => Object.assign(r.blob, { id: r.id }) as IUploadedFile),
        ),
    [],
  );

  const addTempImages = async (files: File[]) => {
    const records = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      blob: file,
      createdAt: new Date(),
    }));
    await db.tempSkillImages.bulkPut(records);
  };

  const removeTempImage = async (imageId: string) => {
    await db.tempSkillImages.delete(imageId);
  };

  const commitImages = async () => {
    await db.images.clear();
    const tempRecords = await db.tempSkillImages.toArray();
    if (tempRecords.length > 0) {
      const permanentRecords = tempRecords.map((r) => ({
        blob: r.blob,
        createdAt: r.createdAt,
      }));
      await db.images.bulkAdd(permanentRecords);
      await db.tempSkillImages.clear();
    }
  };

  const discardImages = async () => {
    await db.tempSkillImages.clear();
  };

  return {
    tempImages: tempImages ?? [],
    addTempImages,
    removeTempImage,
    commitImages,
    discardImages,
  };
}
