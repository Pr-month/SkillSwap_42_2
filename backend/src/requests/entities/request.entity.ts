import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';
import { RequestStatus } from '../requests.enums';
import { DatabaseConstraints } from '../../common/database-constraints';

@Entity('requests')
@Unique(DatabaseConstraints.UQ_REQUEST_SKILLS, [
  'offeredSkill',
  'requestedSkill',
])
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver!: User;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  @ManyToOne(() => Skill, { nullable: false, onDelete: 'RESTRICT' })
  offeredSkill!: Skill;

  @ManyToOne(() => Skill, { nullable: false, onDelete: 'RESTRICT' })
  requestedSkill!: Skill;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
