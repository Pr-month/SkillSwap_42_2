import dataSource from '../config/data-source';

export async function clearDatabase() {
  await dataSource.initialize();
  await dataSource.synchronize(true);
}
