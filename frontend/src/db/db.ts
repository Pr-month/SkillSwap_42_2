import Dexie, { type Table } from "dexie";

export interface AvatarRecord {
  key: "user-avatar"; // Фиксированный ключ
  blob: File;
  createdAt: Date;
}

export interface ImageRecord {
  id?: number; // автоинкремент
  blob: File;
  createdAt: Date;
}

export interface TempAvatarRecord {
  key: "registration-temp-avatar";
  blob: File;
  createdAt: Date;
}

export interface TempSkillImageRecord {
  id: string;
  blob: File;
  createdAt: Date;
}

class AppDatabase extends Dexie {
  public avatars!: Table<AvatarRecord>;
  public images!: Table<ImageRecord>;
  public tempRegistrationAvatars!: Table<TempAvatarRecord>;
  public tempSkillImages!: Table<TempSkillImageRecord>;

  constructor() {
    super("MyAppStorage");
    this.version(3).stores({
      avatars: "key",
      tempRegistrationAvatars: "key",
      images: "++id, createdAt",
      tempSkillImages: "id, createdAt",
    });
  }
}

export const db = new AppDatabase();
