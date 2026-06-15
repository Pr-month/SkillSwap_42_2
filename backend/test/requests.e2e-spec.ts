import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

interface RequestResponse {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  offeredSkill: {
    id: string;
    title: string;
  };
  requestedSkill: {
    id: string;
    title: string;
  };
  isRead: boolean;
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

interface CategoryResponse {
  id: string;
  name: string;
  parent: string | null;
}

interface SkillResponse {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  category: {
    id: string;
    name: string;
  } | null;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
}

const makeRequest = (app: INestApplication) => {
  return request(app.getHttpServer());
};

describe('Requests (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let user1AccessToken: string;
  let user2AccessToken: string;
  let user1Id: string;
  let user2Id: string;
  let testCategoryId: string;
  let user1SkillId = '';
  let user2SkillId = '';
  let testRequestId = '';

  const user1 = {
    name: 'E2E User One',
    email: `e2e_requests_user1_${Date.now()}@example.com`,
    password: 'Test123456',
    about: 'First user for requests tests',
    birthdate: '1990-01-01',
    city: 'Test City',
    gender: 'OTHER',
    wantToLearn: [] as string[],
  };

  const user2 = {
    name: 'E2E User Two',
    email: `e2e_requests_user2_${Date.now()}@example.com`,
    password: 'Test123456',
    about: 'Second user for requests tests',
    birthdate: '1992-02-02',
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
      .send({ name: 'E2E Requests Category', parent: null })
      .expect(201);

    const categoryBody = categoryResponse.body as CategoryResponse;
    testCategoryId = categoryBody.id;

    const userCategoryResponse = await req
      .post('/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({ name: 'E2E Requests User Category', parent: null })
      .expect(201);

    const userCategoryBody = userCategoryResponse.body as CategoryResponse;
    const userCategoryId = userCategoryBody.id;

    user1.wantToLearn = [userCategoryId];
    user2.wantToLearn = [userCategoryId];

    await req.post('/auth/register').send(user1).expect(201);
    await req.post('/auth/register').send(user2).expect(201);

    const login1Response = await req
      .post('/auth/login')
      .send({ email: user1.email, password: user1.password })
      .expect(200);

    const login1Body = login1Response.body as LoginResponse;
    user1AccessToken = login1Body.accessToken;

    const login2Response = await req
      .post('/auth/login')
      .send({ email: user2.email, password: user2.password })
      .expect(200);

    const login2Body = login2Response.body as LoginResponse;
    user2AccessToken = login2Body.accessToken;

    const me1Response = await req
      .get('/users/me')
      .set('Authorization', `Bearer ${user1AccessToken}`)
      .expect(200);

    const me1Body = me1Response.body as UserResponse;
    user1Id = me1Body.id;

    const me2Response = await req
      .get('/users/me')
      .set('Authorization', `Bearer ${user2AccessToken}`)
      .expect(200);

    const me2Body = me2Response.body as UserResponse;
    user2Id = me2Body.id;

    const skill1Response = await req
      .post('/skills')
      .set('Authorization', `Bearer ${user1AccessToken}`)
      .send({
        title: 'User1 Offer Skill',
        description: 'Skill offered by user1',
        category: testCategoryId,
        images: [],
      })
      .expect(201);

    const skill1Body = skill1Response.body as SkillResponse;
    user1SkillId = skill1Body.id;

    const skill2Response = await req
      .post('/skills')
      .set('Authorization', `Bearer ${user2AccessToken}`)
      .send({
        title: 'User2 Request Skill',
        description: 'Skill requested from user2',
        category: testCategoryId,
        images: [],
      })
      .expect(201);

    const skill2Body = skill2Response.body as SkillResponse;
    user2SkillId = skill2Body.id;
  });

  afterAll(async () => {
    const req = makeRequest(app);

    if (testRequestId) {
      try {
        await req
          .delete(`/requests/${testRequestId}`)
          .set('Authorization', `Bearer ${adminAccessToken}`);
      } catch {
        // Ignore cleanup errors
      }
    }

    if (user1SkillId) {
      try {
        await req
          .delete(`/skills/${user1SkillId}`)
          .set('Authorization', `Bearer ${user1AccessToken}`);
      } catch {
        // Ignore cleanup errors
      }
    }

    if (user2SkillId) {
      try {
        await req
          .delete(`/skills/${user2SkillId}`)
          .set('Authorization', `Bearer ${user2AccessToken}`);
      } catch {
        // Ignore cleanup errors
      }
    }

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

  describe('POST /requests', () => {
    it('should create a new request', async () => {
      const req = makeRequest(app);
      const createData = {
        requestedSkillId: user2SkillId,
        offeredSkillId: user1SkillId,
      };

      const response = await req
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(createData)
        .expect(201);

      const body = response.body as RequestResponse;
      expect(body).toHaveProperty('id');
      expect(body.sender.id).toBe(user1Id);
      expect(body.receiver.id).toBe(user2Id);
      expect(body.offeredSkill.id).toBe(user1SkillId);
      expect(body.requestedSkill.id).toBe(user2SkillId);
      expect(body.status).toBe('pending');

      testRequestId = body.id;
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      const createData = {
        requestedSkillId: user2SkillId,
        offeredSkillId: user1SkillId,
      };

      await req.post('/requests').send(createData).expect(401);
    });

    it('should return 400 for invalid skill IDs', async () => {
      const req = makeRequest(app);
      const invalidData = {
        requestedSkillId: 'invalid-uuid',
        offeredSkillId: 'invalid-uuid',
      };

      const response = await req
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(invalidData)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });

    it('should return 404 for non-existent requested skill', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const createData = {
        requestedSkillId: nonExistentId,
        offeredSkillId: user1SkillId,
      };

      await req
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(createData)
        .expect(404);
    });
  });

  describe('GET /requests/incoming', () => {
    it('should return incoming requests for user', async () => {
      const req = makeRequest(app);
      const response = await req
        .get('/requests/incoming')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(200);

      const body = response.body as RequestResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0].receiver.id).toBe(user2Id);
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      await req.get('/requests/incoming').expect(401);
    });
  });

  describe('GET /requests/outgoing', () => {
    it('should return outgoing requests for user', async () => {
      const req = makeRequest(app);
      const response = await req
        .get('/requests/outgoing')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);

      const body = response.body as RequestResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0].sender.id).toBe(user1Id);
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      await req.get('/requests/outgoing').expect(401);
    });
  });

  describe('PATCH /requests/:id', () => {
    it('should accept request as receiver', async () => {
      const req = makeRequest(app);
      const updateData = { status: 'accepted' };

      const response = await req
        .patch(`/requests/${testRequestId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(updateData)
        .expect(200);

      const body = response.body as RequestResponse;
      expect(body.status).toBe('accepted');
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      const updateData = { status: 'rejected' };

      await req
        .patch(`/requests/${testRequestId}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 403 when sender tries to accept request', async () => {
      const req = makeRequest(app);
      const updateData = { status: 'accepted' };

      await req
        .patch(`/requests/${testRequestId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent request', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { status: 'accepted' };

      await req
        .patch(`/requests/${nonExistentId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid status', async () => {
      const req = makeRequest(app);
      const updateData = { status: 'invalid-status' };

      const response = await req
        .patch(`/requests/${testRequestId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send(updateData)
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.message).toBeDefined();
    });
  });

  describe('DELETE /requests/:id', () => {
    let deleteRequestId = '';
    let uniqueOfferedSkillId: string;
    let uniqueRequestedSkillId: string;

    beforeAll(async () => {
      const req = makeRequest(app);

      const skill1Response = await req
        .post('/skills')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({
          title: `User1 Delete Offer Skill ${Date.now()}`,
          description: 'Unique skill for delete test',
          category: testCategoryId,
          images: [],
        })
        .expect(201);

      const skill1Body = skill1Response.body as SkillResponse;
      uniqueOfferedSkillId = skill1Body.id;

      const skill2Response = await req
        .post('/skills')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send({
          title: `User2 Delete Request Skill ${Date.now()}`,
          description: 'Unique skill for delete test',
          category: testCategoryId,
          images: [],
        })
        .expect(201);

      const skill2Body = skill2Response.body as SkillResponse;
      uniqueRequestedSkillId = skill2Body.id;

      const createData = {
        requestedSkillId: uniqueRequestedSkillId,
        offeredSkillId: uniqueOfferedSkillId,
      };

      const response = await req
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(createData)
        .expect(201);

      const body = response.body as RequestResponse;
      deleteRequestId = body.id;
    });

    afterAll(async () => {
      const req = makeRequest(app);

      if (uniqueOfferedSkillId) {
        try {
          await req
            .delete(`/skills/${uniqueOfferedSkillId}`)
            .set('Authorization', `Bearer ${user1AccessToken}`);
        } catch {
          // Ignore cleanup errors
        }
      }

      if (uniqueRequestedSkillId) {
        try {
          await req
            .delete(`/skills/${uniqueRequestedSkillId}`)
            .set('Authorization', `Bearer ${user2AccessToken}`);
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it('should delete request as sender', async () => {
      const req = makeRequest(app);
      await req
        .delete(`/requests/${deleteRequestId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(200);
    });

    it('should return 401 without auth token', async () => {
      const req = makeRequest(app);
      await req.delete(`/requests/${deleteRequestId}`).expect(401);
    });

    it('should return 404 for non-existent request', async () => {
      const req = makeRequest(app);
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await req
        .delete(`/requests/${nonExistentId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .expect(404);
    });

    it('should return 403 when non-owner tries to delete', async () => {
      const req = makeRequest(app);

      const skill1Response = await req
        .post('/skills')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send({
          title: `Temp Offer Skill ${Date.now()}`,
          description: 'Temporary skill',
          category: testCategoryId,
          images: [],
        })
        .expect(201);

      const skill1Body = skill1Response.body as SkillResponse;
      const tempOfferedSkillId = skill1Body.id;

      const skill2Response = await req
        .post('/skills')
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .send({
          title: `Temp Request Skill ${Date.now()}`,
          description: 'Temporary skill',
          category: testCategoryId,
          images: [],
        })
        .expect(201);

      const skill2Body = skill2Response.body as SkillResponse;
      const tempRequestedSkillId = skill2Body.id;

      const createData = {
        requestedSkillId: tempRequestedSkillId,
        offeredSkillId: tempOfferedSkillId,
      };

      const response = await req
        .post('/requests')
        .set('Authorization', `Bearer ${user1AccessToken}`)
        .send(createData)
        .expect(201);

      const body = response.body as RequestResponse;
      const tempRequestId = body.id;

      await req
        .delete(`/requests/${tempRequestId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`)
        .expect(403);

      await req
        .delete(`/skills/${tempOfferedSkillId}`)
        .set('Authorization', `Bearer ${user1AccessToken}`);

      await req
        .delete(`/skills/${tempRequestedSkillId}`)
        .set('Authorization', `Bearer ${user2AccessToken}`);
    });
  });
});
