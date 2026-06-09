import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface SkillResponse {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  category: {
    id: string;
    name: string;
    parent: string | null;
  } | null;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginatedSkillsResponse {
  data: SkillResponse[];
  page: number;
  totalPages: number;
}

interface LoginResponse {
  accessToken: string;
}

interface ErrorResponse {
  message: string | string[];
  statusCode: number;
}

interface CategoryResponse {
  id: string;
  name: string;
  parent: string | null;
}

// Типизированная обертка для request
const makeRequest = (app: INestApplication) => {
  return request(app.getHttpServer());
};

describe('Skills (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let userAccessToken: string;
  let secondUserAccessToken: string;
  let testUserId: string;
  let testCategoryId: string;
  let testSkillId = '';
  let secondUserSkillId = '';
  let testCategoryForUser: string;

  const testUser = {
    name: 'E2E Test User',
    email: `e2e_skills_user_${Date.now()}@example.com`,
    password: 'Test123456',
    about: 'This is an E2E test user for skills',
    birthdate: '1990-01-01',
    city: 'Test City',
    gender: 'OTHER',
    wantToLearn: [] as string[],
  };

  const secondUser = {
    name: 'E2E Second User',
    email: `e2e_skills_second_${Date.now()}@example.com`,
    password: 'Test123456',
    about: 'This is second user for skills tests',
    birthdate: '1992-02-02',
    city: 'Test City 2',
    gender: 'OTHER',
    wantToLearn: [] as string[],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const req = makeRequest(app);

    // Login as admin
    const adminLoginResponse = await req
      .post('/auth/login')
      .send({ email: 'admin@skillswap.com', password: 'Admin123456' })
      .expect(200);

    const adminLoginBody = adminLoginResponse.body as LoginResponse;
    adminAccessToken = adminLoginBody.accessToken;

    // Create a test category for skills
    const categoryResponse = await req
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: 'E2E Skills Test Category', parent: null })
      .expect(201);

    const categoryBody = categoryResponse.body as CategoryResponse;
    testCategoryId = categoryBody.id;

    // Create another category for user's wantToLearn
    const userCategoryResponse = await req
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: 'E2E User Category', parent: null })
      .expect(201);

    const userCategoryBody = userCategoryResponse.body as CategoryResponse;
    testCategoryForUser = userCategoryBody.id;

    // Update testUser with category for wantToLearn
    testUser.wantToLearn = [testCategoryForUser];

    // Create first test user
    await req.post('/auth/register').send(testUser).expect(201);

    const loginResponse = await req
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponse;
    userAccessToken = loginBody.accessToken;

    const meResponse = await req
      .get('/users/me')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);

    const meBody = meResponse.body as SkillResponse;
    testUserId = meBody.id;

    // Update secondUser with category for wantToLearn
    secondUser.wantToLearn = [testCategoryForUser];

    // Create second test user
    await req.post('/auth/register').send(secondUser).expect(201);

    const secondLoginResponse = await req
      .post('/auth/login')
      .send({ email: secondUser.email, password: secondUser.password })
      .expect(200);

    const secondLoginBody = secondLoginResponse.body as LoginResponse;
    secondUserAccessToken = secondLoginBody.accessToken;
  });

  afterAll(async () => {
    const req = makeRequest(app);

    // Clean up skills
    if (testSkillId) {
      try {
        await req
          .delete(`/skills/${testSkillId}`)
          .set('Authorization', `Bearer ${userAccessToken}`);
      } catch {
        // Ignore errors
      }
    }

    if (secondUserSkillId) {
      try {
        await req
          .delete(`/skills/${secondUserSkillId}`)
          .set('Authorization', `Bearer ${secondUserAccessToken}`);
      } catch {
        // Ignore errors
      }
    }

    // Clean up test categories
    if (testCategoryId) {
      try {
        await req
          .delete(`/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch {
        // Ignore errors
      }
    }

    if (testCategoryForUser) {
      try {
        await req
          .delete(`/categories/${testCategoryForUser}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch {
        // Ignore errors
      }
    }

    await app.close();
  });

  describe('POST /skills', () => {
    it('should create a new skill with valid token', async () => {
      const req = makeRequest(app);
      const newSkill = {
        title: 'New Test Skill',
        description: 'Test description',
        category: testCategoryId,
        images: [],
      };

      const response = await req
        .post('/skills')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(newSkill)
        .expect(201);

      const body = response.body as SkillResponse;
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(newSkill.title);
      expect(body.description).toBe(newSkill.description);
      expect(body.category).toHaveProperty('id', testCategoryId);
      expect(body.owner).toHaveProperty('id', testUserId);

      testSkillId = body.id;
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      const newSkill = {
        title: 'Unauthorized Skill',
        description: 'Should not be created',
      };

      await req.post('/skills').send(newSkill).expect(401);
    });

    it('should return 400 for invalid skill data', async () => {
      const req = makeRequest(app);
      const invalidSkill = { title: '' };

      const response = await req
        .post('/skills')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(invalidSkill)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for title too short', async () => {
      const req = makeRequest(app);
      const invalidSkill = { title: 'ab' };

      const response = await req
        .post('/skills')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(invalidSkill)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });
  });

  describe('GET /skills', () => {
    it('should return paginated list of skills', async () => {
      const req = makeRequest(app);
      const response = await req.get('/skills').expect(200);

      const body = response.body as PaginatedSkillsResponse;
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('page');
      expect(body).toHaveProperty('totalPages');
    });

    it('should accept pagination parameters', async () => {
      const req = makeRequest(app);
      const response = await req.get('/skills?page=1&limit=5').expect(200);

      const body = response.body as PaginatedSkillsResponse;
      expect(body.page).toBe(1);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    it('should search skills by title', async () => {
      const req = makeRequest(app);
      const response = await req
        .get('/skills?search=New Test Skill')
        .expect(200);

      const body = response.body as PaginatedSkillsResponse;
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].title).toContain('New Test Skill');
    });

    it('should filter skills by category', async () => {
      const req = makeRequest(app);
      const response = await req
        .get(`/skills?category=${testCategoryId}`)
        .expect(200);

      const body = response.body as PaginatedSkillsResponse;
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].category?.id).toBe(testCategoryId);
    });

    it('should return 404 for out of range page', async () => {
      const req = makeRequest(app);
      await req.get('/skills?page=999999').expect(404);
    });
  });

  describe('GET /skills/:id/similar', () => {
    const cleanupSkillIds: string[] = [];

    beforeAll(async () => {
      const req = makeRequest(app);
      const similarSkill = {
        title: 'Similar Test Skill',
        description: 'This is similar to the test skill',
        category: testCategoryId,
        images: [],
      };

      const response = await req
        .post('/skills')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(similarSkill)
        .expect(201);

      const body = response.body as SkillResponse;
      if (body.id) {
        cleanupSkillIds.push(body.id);
      }
    });

    afterAll(async () => {
      const req = makeRequest(app);
      for (const skillId of cleanupSkillIds) {
        try {
          await req
            .delete(`/skills/${skillId}`)
            .set('Authorization', `Bearer ${userAccessToken}`);
        } catch {
          // Ignore errors
        }
      }
    });

    it('should return similar skills by category', async () => {
      const req = makeRequest(app);
      const response = await req
        .get(`/skills/${testSkillId}/similar`)
        .expect(200);

      const body = response.body as SkillResponse[];
      expect(Array.isArray(body)).toBe(true);
    });

    it('should return 404 for non-existent skill', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await req.get(`/skills/${nonExistentId}/similar`).expect(404);
    });
  });

  describe('PATCH /skills/:id', () => {
    it('should update own skill with valid token', async () => {
      const req = makeRequest(app);
      const updateData = {
        title: 'Updated Test Skill',
        description: 'Updated description',
      };

      const response = await req
        .patch(`/skills/${testSkillId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateData)
        .expect(200);

      const body = response.body as SkillResponse;
      expect(body.title).toBe(updateData.title);
      expect(body.description).toBe(updateData.description);
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      const updateData = { title: 'Should Fail' };

      await req.patch(`/skills/${testSkillId}`).send(updateData).expect(401);
    });

    it('should return 403 when updating another users skill', async () => {
      const req = makeRequest(app);
      const secondUserSkill = {
        title: 'Second User Skill',
        description: 'This belongs to second user',
        category: testCategoryId,
        images: [],
      };

      const createResponse = await req
        .post('/skills')
        .set('Authorization', `Bearer ${secondUserAccessToken}`)
        .send(secondUserSkill)
        .expect(201);

      const createBody = createResponse.body as SkillResponse;
      secondUserSkillId = createBody.id;

      const updateData = { title: 'Attempted Hack' };

      await req
        .patch(`/skills/${secondUserSkillId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent skill', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { title: 'Non Existent' };

      await req
        .patch(`/skills/${nonExistentId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('POST /skills/:id/favorite', () => {
    it('should add skill to favorites', async () => {
      const req = makeRequest(app);
      const response = await req
        .post(`/skills/${testSkillId}/favorite`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(201);

      const body = response.body as { id: string; favoriteSkills: unknown[] };
      expect(body.favoriteSkills).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      await req.post(`/skills/${testSkillId}/favorite`).expect(401);
    });

    it('should return 409 when adding already favorited skill', async () => {
      const req = makeRequest(app);
      const response = await req
        .post(`/skills/${testSkillId}/favorite`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(409);

      const body = response.body as ErrorResponse;
      expect(body.message).toContain('already in favorites');
    });
  });

  describe('DELETE /skills/:id/favorite', () => {
    it('should remove skill from favorites', async () => {
      const req = makeRequest(app);
      const response = await req
        .delete(`/skills/${testSkillId}/favorite`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      const body = response.body as { id: string; favoriteSkills: unknown[] };
      expect(body.favoriteSkills).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      await req.delete(`/skills/${testSkillId}/favorite`).expect(401);
    });

    it('should return 400 when removing non-favorited skill', async () => {
      const req = makeRequest(app);
      const response = await req
        .delete(`/skills/${testSkillId}/favorite`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toContain('not in favorites');
    });
  });

  describe('DELETE /skills/:id', () => {
    it('should delete own skill with valid token', async () => {
      const req = makeRequest(app);
      const skillToDelete = {
        title: 'Skill To Delete',
        description: 'This skill will be deleted',
        category: testCategoryId,
        images: [],
      };

      const createResponse = await req
        .post('/skills')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(skillToDelete)
        .expect(201);

      const createBody = createResponse.body as SkillResponse;
      const skillId = createBody.id;

      await req
        .delete(`/skills/${skillId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      await req.delete(`/skills/${testSkillId}`).expect(401);
    });

    it('should return 403 when deleting another users skill', async () => {
      const req = makeRequest(app);
      const secondUserSkill = {
        title: 'Second User Skill To Delete',
        description: 'This belongs to second user',
        category: testCategoryId,
        images: [],
      };

      const createResponse = await req
        .post('/skills')
        .set('Authorization', `Bearer ${secondUserAccessToken}`)
        .send(secondUserSkill)
        .expect(201);

      const createBody = createResponse.body as SkillResponse;
      const skillId = createBody.id;

      await req
        .delete(`/skills/${skillId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(403);

      await req
        .delete(`/skills/${skillId}`)
        .set('Authorization', `Bearer ${secondUserAccessToken}`);
    });

    it('should return 404 for non-existent skill', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await req
        .delete(`/skills/${nonExistentId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(404);
    });
  });
});
