import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // TODO: Add a relation to skills categories
  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @ManyToOne(() => User, (user) => user.skills)
  owner: User;
}
