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
    
    const saltRounds = 10;
    
    const usersToCreate: User[] = [];
    
    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password as string, saltRounds);
      
      const user = new User();
      user.name = userData.name as string;
      user.email = userData.email as string;
      user.password = hashedPassword;
      user.about = userData.about || '';
      user.birthdate = userData.birthdate as string;
      user.city = userData.city as string;
      user.gender = userData.gender as User['gender'];
      user.wantToLearn = userData.wantToLearn || [];
      user.role = UserRole.USER;
      user.refreshToken = '';
      user.avatar = '';
      user.skills = [];
      user.favoriteSkills = [];
      
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