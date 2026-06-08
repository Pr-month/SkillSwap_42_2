import { dataSource } from '../config/database.config';
import { City } from '../cities/entities/city.entity';
import { citiesData } from './data/cities.data';

async function citiesSeed() {
  try {
    await dataSource.initialize();

    const cityRepo = dataSource.getRepository(City);

    const count = await cityRepo.count();
    if (count !== 0) {
      console.log('Города уже существуют в базе данных. Заполнение пропущено.');
      return;
    }

    const citiesToCreate = citiesData.map((cityData) => {
      const city = new City();
      city.name = cityData.name;
      return city;
    });

    await cityRepo.save(citiesToCreate);
    console.log(`Успешно добавлено ${citiesToCreate.length} городов`);
  } catch (error) {
    console.error('Ошибка при заполнении городов:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void citiesSeed();
