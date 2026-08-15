import { describe, it, expect } from 'vitest';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import request from 'supertest';

// Test Express application instance
const app = express();

app.use(express.json());
app.use(session({
  secret: 'some_long_secret_for_rack_session_cookie_1234567890',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

// Security Guard Middleware
app.use('/api/admin', (req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith('/auth')) {
    if (!(req.session as any).userId) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not logged in' } });
    }
  }
  next();
});

app.post('/api/admin/auth/login', (req, res) => {
  if (req.body.username === 'admin' && req.body.password === 'password') {
    (req.session as any).userId = 1;
    res.status(200).json({ success: true, user: { id: 1, username: 'admin', role: 'admin' } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.get('/api/admin/auth/me', (req, res) => {
  if ((req.session as any).userId) {
    res.status(200).json({ success: true, user: { id: 1, username: 'admin', role: 'admin' } });
  } else {
    res.status(401).json({ success: false, error: 'Not authenticated' });
  }
});

app.post('/api/admin/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ success: true });
  });
});

app.get('/api/admin/users', (req, res) => {
  res.status(200).json({ success: true, data: [{ id: 1, name: 'Admin' }] });
});

describe('Server Side Session Authentication', () => {
  let cookie: string[] = [];

  it('POST /api/admin/auth/login sets a session cookie', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'password' });
      
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    cookie = res.headers['set-cookie']; // save cookie for next tests
  });

  it('GET /api/admin/auth/me returns 401 Unauthorized without session', async () => {
    const res = await request(app).get('/api/admin/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/auth/me returns 200 OK with session', async () => {
    const res = await request(app)
      .get('/api/admin/auth/me')
      .set('Cookie', cookie);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('admin');
  });

  it('POST /api/admin/auth/logout clears the session', async () => {
    await request(app)
      .post('/api/admin/auth/logout')
      .set('Cookie', cookie);
      
    const res = await request(app)
      .get('/api/admin/auth/me')
      .set('Cookie', cookie);
      
    expect(res.status).toBe(401);
  });

  it('Security Guard: GET /api/admin/users without session returns 401', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('Security Guard: GET /api/admin/users with session returns 200', async () => {
    // login again to get a fresh cookie
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'password' });
    const freshCookie = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', freshCookie);
      
    expect(res.status).toBe(200);
  });
});
