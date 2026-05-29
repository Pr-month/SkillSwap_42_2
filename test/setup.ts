import { dataSource } from '../src/config/database.config';

beforeAll(async () => {
  await dataSource.initialize();
});

afterAll(async () => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
});
