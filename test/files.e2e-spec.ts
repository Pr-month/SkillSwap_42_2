import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';

interface LoginResponse {
  accessToken: string;
}

interface ErrorResponse {
  message: string | string[];
  statusCode: number;
}

interface UploadResponse {
  url: string;
}

interface CategoryResponse {
  id: string;
  name: string;
  parent: string | null;
}

const makeRequest = (app: INestApplication) => {
  return request(app.getHttpServer());
};

describe('Files (e2e)', () => {
  let app: INestApplication;
  let userAccessToken: string;
  let adminAccessToken: string;
  let testCategoryId: string;

  const testUser = {
    name: 'E2E Files Test User',
    email: `e2e_files_${Date.now()}@example.com`,
    password: 'Test123456',
    about: 'This is an E2E test user for files',
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
      .send({ name: 'E2E Files Category', parent: null })
      .expect(201);

    const categoryBody = categoryResponse.body as CategoryResponse;
    testCategoryId = categoryBody.id;

    testUser.wantToLearn = [testCategoryId];

    await req.post('/auth/register').send(testUser).expect(201);

    const loginResponse = await req
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponse;
    userAccessToken = loginBody.accessToken;
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

  describe('POST /upload', () => {
    it('should upload a file with valid token', async () => {
      const req = makeRequest(app);
      const testImagePath = join(__dirname, 'fixtures', 'test-image.jpg');

      const response = await req
        .post('/upload')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .attach('file', testImagePath)
        .expect(201);

      const body = response.body as UploadResponse;
      expect(body).toHaveProperty('url');
      expect(body.url).toMatch(/^\/uploads\/[a-f0-9-]+\.jpg$/);

      const uploadedFilePath = join(
        process.cwd(),
        'public',
        body.url.replace(/^\//, ''),
      );
      expect(existsSync(uploadedFilePath)).toBe(true);

      const filename = body.url.split('/').pop();
      if (filename) {
        const filePath = join(process.cwd(), 'public', 'uploads', filename);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      }
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      const testImagePath = join(__dirname, 'fixtures', 'test-image.jpg');

      await req.post('/upload').attach('file', testImagePath).expect(401);
    });

    it('should return 401 with invalid token', async () => {
      const req = makeRequest(app);
      const testImagePath = join(__dirname, 'fixtures', 'test-image.jpg');

      await req
        .post('/upload')
        .set('Authorization', 'Bearer invalid-token')
        .attach('file', testImagePath)
        .expect(401);
    });

    it('should return 400 when no file is uploaded', async () => {
      const req = makeRequest(app);
      const response = await req
        .post('/upload')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for invalid file type', async () => {
      const req = makeRequest(app);
      const textFilePath = join(__dirname, 'fixtures', 'test-text.txt');

      const response = await req
        .post('/upload')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .attach('file', textFilePath)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });
  });
});
