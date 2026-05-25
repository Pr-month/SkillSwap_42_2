import { DataSource } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { flattenCategories } from './data/categories.data';
import { databaseConfig } from '../config/database.config';

async function categoriesSeed() {
  const dataSource = new DataSource(databaseConfig());

  try {
    await dataSource.initialize();

    const categoryRepo = dataSource.getRepository(Category);

    const count = await categoryRepo.count();
    if (count !== 0) {
      console.log(
        'Категории уже существуют в базе данных. Заполнение пропущено.',
      );
      return;
    }

    const flattenedCategories = flattenCategories();
    const categoryMap = new Map<string, Category>();
    const categoriesToCreate: Category[] = [];

    for (const categoryData of flattenedCategories) {
      const category = new Category();
      category.name = categoryData.name;
      category.parent = null;
      categoriesToCreate.push(category);
      categoryMap.set(categoryData.name, category);
    }

    for (let i = 0; i < flattenedCategories.length; i++) {
      const categoryData = flattenedCategories[i];
      if (categoryData.parent) {
        const parentCategory = categoryMap.get(categoryData.parent);
        if (parentCategory) {
          categoriesToCreate[i].parent = parentCategory;
        }
      }
    }

    await categoryRepo.save(categoriesToCreate);
    console.log(`Успешно добавлено ${categoriesToCreate.length} категорий`);
  } catch (error) {
    console.error('Ошибка при заполнении категорий:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void categoriesSeed();
