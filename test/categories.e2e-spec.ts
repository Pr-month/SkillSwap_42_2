import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Categories (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
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

  describe('GET /categories/:id', () => {
    it('should return a category by id', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const body = response.body as Array<{ id: string; name: string }>;
      if (body && body.length > 0) {
        const categoryId = body[0].id;
        const getResponse = await request(app.getHttpServer())
          .get(`/categories/${categoryId}`)
          .expect(200);

        expect(getResponse.body).toHaveProperty('id', categoryId);
        expect(getResponse.body).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/categories/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'Test Category',
        parent: null,
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(newCategory)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', newCategory.name);
    });

    it('should return 400 for invalid category data', async () => {
      const invalidCategory = { name: '' };

      await request(app.getHttpServer())
        .post('/categories')
        .send(invalidCategory)
        .expect(400);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update a category', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'To Update', parent: null })
        .expect(201);

      const createdBody = createResponse.body as { id: string; name: string };
      const categoryId = createdBody.id;
      const updateData = { name: 'Updated Category Name' };

      const response = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('name', updateData.name);
    });

    it('should return 404 for updating non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .patch(`/categories/${nonExistentId}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'To Delete', parent: null })
        .expect(201);

      const createdBody = createResponse.body as { id: string; name: string };
      const categoryId = createdBody.id;

      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .expect(200);
    });

    it('should return 404 for deleting non-existent category', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .delete(`/categories/${nonExistentId}`)
        .expect(404);
    });
  });
});
