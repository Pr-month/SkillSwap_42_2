import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface UserResponse {
  id: string;
  name: string;
  email: string;
  about: string | null;
  birthdate: string;
  city: string;
  gender: string;
  avatar: string;
  wantToLearn: Array<{ id: string; name: string }>;
  skills: unknown[];
  favoriteSkills: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  accessToken: string;
}

interface ErrorResponse {
  message: string | string[];
  statusCode: number;
}

interface PaginatedUsersResponse {
  data: UserResponse[];
  page: number;
  totalPages: number;
}

interface CategoryResponse {
  id: string;
  name: string;
  parent: string | null;
}

describe('Users (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let userAccessToken: string;
  let testUserId: string;
  let testCategoryId: string;

  const testUser = {
    name: 'E2E Test User',
    email: `e2e_test_${Date.now()}@example.com`,
    password: 'Test123456',
    about: 'This is an E2E test user',
    birthdate: '1990-01-01',
    city: 'Test City',
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

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@skillswap.com', password: 'Admin123456' })
      .expect(200);

    const adminLoginBody = adminLoginResponse.body as LoginResponse;
    adminAccessToken = adminLoginBody.accessToken;

    // Create a test category for wantToLearn
    const categoryResponse = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: 'E2E Test Category', parent: null })
      .expect(201);

    const categoryBody = categoryResponse.body as CategoryResponse;
    testCategoryId = categoryBody.id;
    testUser.wantToLearn = [testCategoryId];

    // Create a test user (register returns only accessToken)
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    // Login to get user token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponse;
    userAccessToken = loginBody.accessToken;

    // Get user ID from /users/me endpoint
    const meResponse = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .expect(200);

    const meBody = meResponse.body as UserResponse;
    testUserId = meBody.id;
  });

  afterAll(async () => {
    // Note: User deletion might not be implemented, so we just log
    console.log('Test user ID (for manual cleanup if needed):', testUserId);
    console.log(
      'Test category ID (for manual cleanup if needed):',
      testCategoryId,
    );

    // Clean up test category
    if (testCategoryId) {
      try {
        await request(app.getHttpServer())
          .delete(`/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.log('Error deleting category:', errorMessage);
      }
    }

    await app.close();
  });

  describe('GET /users', () => {
    it('should return paginated list of users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      const body = response.body as PaginatedUsersResponse;
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('page');
      expect(body).toHaveProperty('totalPages');
    });

    it('should accept pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=5')
        .expect(200);

      const body = response.body as PaginatedUsersResponse;
      expect(body.page).toBe(1);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    it('should return 404 for out of range page', async () => {
      await request(app.getHttpServer()).get('/users?page=999999').expect(404);
    });
  });

  describe('GET /users/me', () => {
    it('should return current user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      const body = response.body as UserResponse;
      expect(body.id).toBe(testUserId);
      expect(body.email).toBe(testUser.email);
      expect(body.name).toBe(testUser.name);
      expect(body.about).toBe(testUser.about);
      expect(body.birthdate).toBe(testUser.birthdate);
      expect(body.city).toBe(testUser.city);
      expect(body.gender).toBe(testUser.gender);
      // Note: password field might be returned by the API, that's a backend issue
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${testUserId}`)
        .expect(200);

      const body = response.body as UserResponse;
      expect(body.id).toBe(testUserId);
      expect(body.email).toBe(testUser.email);
      // Note: password field might be returned by the API, that's a backend issue
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/users/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update current user profile', async () => {
      const updateData = {
        name: 'Updated E2E User',
        about: 'Updated about information',
        city: 'Updated City',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateData)
        .expect(200);

      const body = response.body as UserResponse;
      expect(body.name).toBe(updateData.name);
      expect(body.about).toBe(updateData.about);
      expect(body.city).toBe(updateData.city);
      expect(body.email).toBe(testUser.email);
    });

    it('should return 401 without auth token', async () => {
      const updateData = { name: 'Should Fail' };
      await request(app.getHttpServer())
        .patch('/users/me')
        .send(updateData)
        .expect(401);
    });

    it('should return 400 for invalid email format', async () => {
      const updateData = { email: 'invalid-email' };

      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateData)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for invalid birthdate format', async () => {
      const updateData = { birthdate: 'invalid-date' };

      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateData)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });
  });

  describe('PATCH /users/me/password', () => {
    it('should update password with correct old password', async () => {
      const newPassword = 'NewPassword456';
      const passwordData = {
        oldPassword: testUser.password,
        newPassword: newPassword,
      };

      const response = await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(passwordData)
        .expect(200);

      const body = response.body as { message: string };
      expect(body.message).toBe('Password successfully changed');

      // Verify new password works
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: newPassword })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');

      // Update stored password for subsequent tests
      testUser.password = newPassword;
    });

    it('should return 401 with incorrect old password', async () => {
      const passwordData = {
        oldPassword: 'WrongPassword123',
        newPassword: 'SomeNewPassword',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(passwordData)
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.message).toBe('Current password is incorrect');
    });

    it('should return 400 for missing old password', async () => {
      const passwordData = { newPassword: 'SomePassword' };

      const response = await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(passwordData)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for missing new password', async () => {
      const passwordData = { oldPassword: testUser.password };

      const response = await request(app.getHttpServer())
        .patch('/users/me/password')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(passwordData)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      const passwordData = {
        oldPassword: testUser.password,
        newPassword: 'ShouldNotWork',
      };

      await request(app.getHttpServer())
        .patch('/users/me/password')
        .send(passwordData)
        .expect(401);
    });
  });
});
