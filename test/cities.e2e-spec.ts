import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface CityResponse {
  id: string;
  name: string;
}

interface PaginatedCitiesResponse {
  data: CityResponse[];
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

const makeRequest = (app: INestApplication) => {
  return request(app.getHttpServer());
};

describe('Cities (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let userAccessToken: string;
  let testCityId = '';
  let testCategoryForUser: string;

  const testUser = {
    name: 'E2E Test User',
    email: `e2e_cities_user_${Date.now()}@example.com`,
    password: 'Test123456',
    about: 'This is an E2E test user for cities',
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

    const userCategoryResponse = await req
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: 'E2E User Category', parent: null })
      .expect(201);

    const userCategoryBody = userCategoryResponse.body as CategoryResponse;
    testCategoryForUser = userCategoryBody.id;

    testUser.wantToLearn = [testCategoryForUser];

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

    if (testCityId) {
      try {
        await req
          .delete(`/cities/${testCityId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch {
        // Ignore cleanup errors
      }
    }

    if (testCategoryForUser) {
      try {
        await req
          .delete(`/categories/${testCategoryForUser}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch {
        // Ignore cleanup errors
      }
    }

    await app.close();
  });

  describe('POST /cities', () => {
    it('should create a new city with admin auth', async () => {
      const req = makeRequest(app);
      const newCity = {
        name: 'New Test City',
      };

      const response = await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCity)
        .expect(201);

      const body = response.body as CityResponse;
      expect(body).toHaveProperty('id');
      expect(body.name).toBe(newCity.name);

      if (body.id && !testCityId) {
        testCityId = body.id;
      }
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      const newCity = {
        name: 'Unauthorized City',
      };

      await req.post('/cities').send(newCity).expect(401);
    });

    it('should return 403 with user role (non-admin)', async () => {
      const req = makeRequest(app);
      const newCity = {
        name: 'User Created City',
      };

      await req
        .post('/cities')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(newCity)
        .expect(403);
    });

    it('should return 400 for invalid city data', async () => {
      const req = makeRequest(app);
      const invalidCity = { name: '' };

      const response = await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidCity)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 400 for name too long', async () => {
      const req = makeRequest(app);
      const invalidCity = { name: 'a'.repeat(101) };

      const response = await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(invalidCity)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });
  });

  describe('GET /cities', () => {
    it('should return paginated list of cities', async () => {
      const req = makeRequest(app);
      const response = await req.get('/cities').expect(200);

      const body = response.body as PaginatedCitiesResponse;
      expect(body).toHaveProperty('data');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('page');
      expect(body).toHaveProperty('totalPages');
    });

    it('should accept pagination parameters', async () => {
      const req = makeRequest(app);
      const response = await req.get('/cities?page=1&limit=5').expect(200);

      const body = response.body as PaginatedCitiesResponse;
      expect(body.page).toBe(1);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    it('should return cities sorted by name ascending', async () => {
      const req = makeRequest(app);

      const city1 = { name: 'Alpha City' };
      const city2 = { name: 'Beta City' };
      const city3 = { name: 'Gamma City' };

      await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(city1)
        .expect(201);

      await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(city2)
        .expect(201);

      await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(city3)
        .expect(201);

      const response = await req.get('/cities').expect(200);

      const body = response.body as PaginatedCitiesResponse;
      const names = body.data.map((city: CityResponse) => city.name);

      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should return 404 for out of range page', async () => {
      const req = makeRequest(app);
      await req.get('/cities?page=999999').expect(404);
    });
  });

  describe('GET /cities/:id', () => {
    let getCityId = '';

    beforeAll(async () => {
      const req = makeRequest(app);
      const newCity = { name: 'City For Get Test' };
      const createResponse = await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCity)
        .expect(201);

      const body = createResponse.body as CityResponse;
      getCityId = body.id;
    });

    afterAll(async () => {
      const req = makeRequest(app);
      try {
        await req
          .delete(`/cities/${getCityId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should return city by id', async () => {
      const req = makeRequest(app);
      const response = await req.get(`/cities/${getCityId}`).expect(200);

      const body = response.body as CityResponse;
      expect(body).toHaveProperty('id', getCityId);
      expect(body.name).toBe('City For Get Test');
    });

    it('should return 404 for non-existent city', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      await req.get(`/cities/${nonExistentId}`).expect(404);
    });
  });

  describe('PATCH /cities/:id', () => {
    let updateCityId = '';

    beforeAll(async () => {
      const req = makeRequest(app);
      const newCity = { name: 'City To Update' };
      const createResponse = await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCity)
        .expect(201);

      const body = createResponse.body as CityResponse;
      updateCityId = body.id;
    });

    afterAll(async () => {
      const req = makeRequest(app);
      try {
        await req
          .delete(`/cities/${updateCityId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should update city with admin auth', async () => {
      const req = makeRequest(app);
      const updateData = { name: 'Updated City Name' };

      const response = await req
        .patch(`/cities/${updateCityId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateData)
        .expect(200);

      const body = response.body as CityResponse;
      expect(body.name).toBe(updateData.name);
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      const updateData = { name: 'Should Fail' };

      await req.patch(`/cities/${updateCityId}`).send(updateData).expect(401);
    });

    it('should return 403 with user role (non-admin)', async () => {
      const req = makeRequest(app);
      const updateData = { name: 'User Update Attempt' };

      await req
        .patch(`/cities/${updateCityId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent city', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { name: 'Non Existent' };

      await req
        .patch(`/cities/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /cities/:id', () => {
    it('should delete city with admin auth', async () => {
      const req = makeRequest(app);
      const newCity = { name: 'City To Delete' };
      const createResponse = await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCity)
        .expect(201);

      const body = createResponse.body as CityResponse;
      const cityId = body.id;

      await req
        .delete(`/cities/${cityId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      const newCity = { name: 'Temp Delete Test' };
      const createResponse = await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCity)
        .expect(201);

      const body = createResponse.body as CityResponse;
      const tempId = body.id;

      await req.delete(`/cities/${tempId}`).expect(401);

      await req
        .delete(`/cities/${tempId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });

    it('should return 403 with user role (non-admin)', async () => {
      const req = makeRequest(app);
      const newCity = { name: 'User Delete Test' };
      const createResponse = await req
        .post('/cities')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newCity)
        .expect(201);

      const body = createResponse.body as CityResponse;
      const tempId = body.id;

      await req
        .delete(`/cities/${tempId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(403);

      await req
        .delete(`/cities/${tempId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);
    });

    it('should return 404 for non-existent city', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await req
        .delete(`/cities/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });
});
