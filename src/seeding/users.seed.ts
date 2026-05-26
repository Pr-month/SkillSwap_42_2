import * as bcrypt from 'bcrypt';
import { dataSource } from '../config/database.config';
import { User } from '../users/entities/user.entity';
import { usersData } from './data/users.data';
import { UserRole } from '../users/users.enums';

async function usersSeed() {
  try {
    await dataSource.initialize();

    const userRepo = dataSource.getRepository(User);

    const count = await userRepo.count();
    if (count !== 0) {
      console.log('Users already exist in database. Seeding skipped.');
      return;
    }

    const saltRounds = parseInt(process.env.HASH_SALT || '10', 10);

    const usersToCreate: User[] = [];

    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(
        userData.password as string,
        saltRounds,
      );

      const user = userRepo.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        about: userData.about,
        birthdate: userData.birthdate,
        city: userData.city,
        gender: userData.gender,
        wantToLearn: [],
        role: UserRole.USER,
        refreshToken: '',
        avatar: '',
        skills: [],
        favoriteSkills: [],
      });
      usersToCreate.push(user);
    }

    await userRepo.save(usersToCreate);
    console.log(`Successfully seeded ${usersToCreate.length} users`);
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void usersSeed();
