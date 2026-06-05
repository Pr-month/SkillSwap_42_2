import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

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

const makeRequest = (app: INestApplication) => {
  return request(app.getHttpServer());
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let testCategoryId: string;

  const testUser = {
    name: 'E2E Auth Test User',
    email: `e2e_auth_${Date.now()}@example.com`,
    password: 'Test123456',
    about: 'This is an E2E test user for auth',
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

    const req = makeRequest(app);

    const adminLoginResponse = await req
      .post('/auth/login')
      .send({ email: 'admin@skillswap.com', password: 'Admin123456' })
      .expect(200);

    const adminLoginBody = adminLoginResponse.body as LoginResponse;
    adminAccessToken = adminLoginBody.accessToken;

    const categoryResponse = await req
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: 'E2E Auth Category', parent: null })
      .expect(201);

    const categoryBody = categoryResponse.body as CategoryResponse;
    testCategoryId = categoryBody.id;

    testUser.wantToLearn = [testCategoryId];
  });

  afterAll(async () => {
    const req = makeRequest(app);

    if (testCategoryId) {
      try {
        await req
          .delete(`/categories/${testCategoryId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch {
        // Ignore cleanup errors
      }
    }

    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const req = makeRequest(app);
      const newUser = {
        name: 'Register Test User',
        email: `register_${Date.now()}@example.com`,
        password: 'Register123',
        about: 'Test user registration',
        birthdate: '1995-05-05',
        city: 'Register City',
        gender: 'OTHER',
        wantToLearn: [testCategoryId],
      };

      const response = await req
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      const body = response.body as LoginResponse;
      expect(body).toHaveProperty('accessToken');
      expect(typeof body.accessToken).toBe('string');
    });

    it('should return 400 for duplicate email', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/auth/register')
        .send(testUser)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for invalid email format', async () => {
      const req = makeRequest(app);
      const invalidUser = {
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'Password123',
        birthdate: '1995-05-05',
        city: 'Test City',
        gender: 'OTHER',
        wantToLearn: [testCategoryId],
      };

      const response = await req
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const req = makeRequest(app);
      const invalidUser = {
        name: 'Incomplete User',
        email: 'incomplete@example.com',
      };

      const response = await req
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for password too short', async () => {
      const req = makeRequest(app);
      const invalidUser = {
        name: 'Weak Password User',
        email: `weak_${Date.now()}@example.com`,
        password: '123',
        birthdate: '1995-05-05',
        city: 'Test City',
        gender: 'OTHER',
        wantToLearn: [testCategoryId],
      };

      const response = await req
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      const req = makeRequest(app);
      await req.post('/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const body = response.body as LoginResponse;
      expect(body).toHaveProperty('accessToken');
      expect(typeof body.accessToken).toBe('string');

      const setCookieHeader = response.headers[
        'set-cookie'
      ] as unknown as string[];
      expect(setCookieHeader).toBeDefined();
      const hasRefreshCookie = setCookieHeader.some((cookie: string) =>
        cookie.startsWith('refresh_token='),
      );
      expect(hasRefreshCookie).toBe(true);
    });

    it('should return 401 with invalid password', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword123' })
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.message).toBe('Invalid credentials');
    });

    it('should return 401 with non-existent email', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123' })
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid email format', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'Password123' })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for missing password', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/auth/login')
        .send({ email: testUser.email })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });
  });

  describe('POST /auth/refresh', () => {
    let validRefreshCookie: string;

    beforeAll(async () => {
      const req = makeRequest(app);
      const loginResponse = await req
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const setCookieHeader = loginResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      validRefreshCookie = setCookieHeader.find((cookie: string) =>
        cookie.startsWith('refresh_token='),
      ) as string;
    });

    it('should refresh access token with valid refresh token', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/auth/refresh')
        .set('Cookie', validRefreshCookie)
        .expect(200);

      const body = response.body as LoginResponse;
      expect(body).toHaveProperty('accessToken');
      expect(typeof body.accessToken).toBe('string');
    });

    it('should return 401 without refresh token', async () => {
      const req = makeRequest(app);
      await req.post('/auth/refresh').expect(401);
    });

    it('should return 401 with invalid refresh token', async () => {
      const req = makeRequest(app);
      await req
        .post('/auth/refresh')
        .set('Cookie', ['refresh_token=invalid-token'])
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeAll(async () => {
      const req = makeRequest(app);
      const loginResponse = await req
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const body = loginResponse.body as LoginResponse;
      accessToken = body.accessToken;
    });

    it('should logout with valid token', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const responseBody = response.body as { message: string };
      expect(responseBody.message).toBe('Logout successful');
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      await req.post('/auth/logout').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      const req = makeRequest(app);
      await req
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should invalidate refresh token after logout', async () => {
      const req = makeRequest(app);

      const loginResponse = await req
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const loginBody = loginResponse.body as LoginResponse;
      const newAccessToken = loginBody.accessToken;
      const setCookieHeader = loginResponse.headers[
        'set-cookie'
      ] as unknown as string[];
      const newRefreshCookie = setCookieHeader.find((cookie: string) =>
        cookie.startsWith('refresh_token='),
      ) as string;

      await req
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      await req
        .post('/auth/refresh')
        .set('Cookie', newRefreshCookie)
        .expect(401);
    });
  });

  describe('Token Validation', () => {
    let validAccessToken: string;

    beforeAll(async () => {
      const req = makeRequest(app);
      const loginResponse = await req
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      const body = loginResponse.body as LoginResponse;
      validAccessToken = body.accessToken;
    });

    it('should access protected route with valid token', async () => {
      const req = makeRequest(app);
      const response = await req
        .get('/users/me')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .expect(200);

      const body = response.body as UserResponse;
      expect(body.email).toBe(testUser.email);
    });

    it('should return 401 with expired token', async () => {
      const req = makeRequest(app);
      await req
        .get('/users/me')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        )
        .expect(401);
    });
  });
});
