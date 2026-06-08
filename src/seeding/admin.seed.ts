import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/users.enums';
import { dataSource } from '../config/database.config';

async function adminSeed() {
  try {
    await dataSource.initialize();

    const userRepo = dataSource.getRepository(User);

    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@skillswap.com';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123456';

    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Seeding skipped.');
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const admin = new User();
    admin.name = 'Administrator';
    admin.email = adminEmail;
    admin.password = hashedPassword;
    admin.about = 'System Administrator';
    admin.birthdate = '1990-01-01';
    admin.city = 'System';
    admin.gender = Gender.OTHER;
    admin.wantToLearn = [];
    admin.role = UserRole.ADMIN;
    admin.refreshToken = '';
    admin.avatar = '';
    admin.skills = [];
    admin.favoriteSkills = [];

    await userRepo.save(admin);
    console.log('Admin user successfully seeded');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void adminSeed();
