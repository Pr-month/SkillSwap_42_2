import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import type { IUploadedFile } from "../../entities/types";

export function useImages() {
  const images = useLiveQuery<IUploadedFile[]>(() => {
    return db.images
      .orderBy("createdAt")
      .toArray()
      .then((arr) =>
        arr.map(
          (r) =>
            Object.assign(r.blob, { id: r.id!.toString() }) as IUploadedFile,
        ),
      );
  }, []);

  const addImages = async (files: File[]) => {
    const records = files.map((file) => ({
      blob: file,
      createdAt: new Date(),
    }));
    await db.images.bulkAdd(records);
  };

  const removeImage = async (imageId: string) => {
    const id = parseInt(imageId, 10);
    if (!isNaN(id)) {
      await db.images.delete(id);
    }
  };

  const clearAllImages = async () => {
    await db.images.clear();
  };

  return {
    images: images ?? [],
    addImages,
    removeImage,
    clearAllImages,
  };
}
