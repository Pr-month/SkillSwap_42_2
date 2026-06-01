import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  const createdCategoryIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@skillswap.com', password: 'Admin123456' });

    adminAccessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    for (const id of createdCategoryIds) {
      try {
        await request(app.getHttpServer())
          .delete(`/categories/${id}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch (error) {
        // Игнорируем ошибки при удалении
      }
    }
    await app.close();
  });

  describe('GET /categories', () => {
    it('should return an array of categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /categories', () => {
    it('should create a new category with admin auth', async () => {
      const newCategory = {
        name: 'E2E Test Category',
        parent: null,
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newCategory.name);

      createdCategoryIds.push(response.body.id);
    });

    it('should return 401 without auth token', async () => {
      const newCategory = {
        name: 'Unauthorized Category',
        parent: null,
      };

      await request(app.getHttpServer())
        .post('/categories')
        .send(newCategory)
        .expect(401);
    });

    it('should return 400 for invalid category data', async () => {
      const invalidCategory = { name: '' };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidCategory)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /categories/:id', () => {
    let testCategoryId: string;

    beforeAll(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'To Update', parent: null })
        .expect(201);

      testCategoryId = createResponse.body.id;
      createdCategoryIds.push(testCategoryId);
    });

    it('should update a category with admin auth', async () => {
      const updateData = { name: 'Updated Category Name' };

      const response = await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updateData.name);
    });

    it('should return 401 without auth token', async () => {
      const updateData = { name: 'Should Fail' };

      await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { name: 'Non Existent' };

      await request(app.getHttpServer())
        .patch(`/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return error when trying to set category as parent of itself', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/categories/${testCategoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ parent: testCategoryId })
        .expect(400);

      expect(response.body.message).toContain('parent');
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category with admin auth', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'To Delete', parent: null })
        .expect(201);

      const categoryId = createResponse.body.id;
      createdCategoryIds.push(categoryId);

      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });

    it('should return 401 without auth token', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'Temp Delete Test', parent: null })
        .expect(201);

      const tempId = createResponse.body.id;
      createdCategoryIds.push(tempId);

      await request(app.getHttpServer())
        .delete(`/categories/${tempId}`)
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/categories/${tempId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });

    it('should return 404 for deleting non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .delete(`/categories/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });
});