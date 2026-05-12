import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', select: false })
  password!: string;

  @Column({ type: 'text', nullable: true })
  about!: string;

  @Column({ type: 'date', nullable: true })
  birthdate!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender!: Gender;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar!: string;

  // TODO: Add a relation to skills
  @Column({ type: 'simple-array', nullable: true })
  skills!: string[];

  // TODO: Add a relation to skills categories
  @Column({ type: 'simple-array', nullable: true })
  wantToLearn!: string[];

  // TODO: Add a relation to skills
  @Column({ type: 'simple-array', nullable: true })
  favoriteSkills!: string[];

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
