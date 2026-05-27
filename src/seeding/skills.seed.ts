import { dataSource } from '../config/database.config';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { skillsData } from './data/skills.data';

async function skillsSeed() {
  try {
    await dataSource.initialize();

    const skillRepo = dataSource.getRepository(Skill);
    const userRepo = dataSource.getRepository(User);

    const skillCount = await skillRepo.count();
    if (skillCount !== 0) {
      console.log('Навыки уже существуют в базе данных. Заполнение пропущено.');
      return;
    }

    const users = await userRepo.find();
    if (users.length === 0) {
      console.log(
        'Пользователи не найдены. Сначала запустите seed пользователей.',
      );
      return;
    }

    const skillsToCreate: Skill[] = [];

    for (let i = 0; i < skillsData.length; i++) {
      const skillData = skillsData[i];
      const owner = users[i % users.length];

      const skill = new Skill();
      skill.title = skillData.title || '';
      skill.description = skillData.description || '';
      skill.images = skillData.images || [];
      skill.owner = owner;

      skillsToCreate.push(skill);
    }

    await skillRepo.save(skillsToCreate);
    console.log(`Успешно добавлено ${skillsToCreate.length} навыков`);
  } catch (error) {
    console.error('Ошибка при заполнении навыков:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void skillsSeed();
