// Isolated Express mock API server for testing Simurgh Protocol endpoints and local development
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { defaultProtocolSchema } from './mockSchema';
import { RootSchemaPayload, ResourceMeta } from '../src/types/schema';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // In-memory test database initialized with sample schema payload
  let activeSchema: RootSchemaPayload = JSON.parse(JSON.stringify(defaultProtocolSchema));

  // Memory database for each resource entity
  const database: Record<string, any[]> = {
    news: Array.from({ length: 25 }, (_, i) => {
      const id = i + 1;
      const titles = [
        "Unveiling Dynamic Schema Rendering Engine v1.6",
        "Distributed Systems & Cloud Architecture Workshop",
        "Q1 Progress Report & Cloud Infrastructure Planning",
        "Database Performance Optimization & API Acceleration",
        "Information Security Standards & Data Encryption Protocol",
        "New Cloud Storage Service & Automated Backup Launch",
        "Network Infrastructure Upgrade & Bandwidth Expansion",
        "User Satisfaction Report on Simurgh Dashboard UI",
        "Introducing Optimistic Concurrency Control System",
        "International IT & Communications Innovation Summit",
        "Monthly Key Performance Indicators & Metrics Analysis",
        "Multi-language Protocol & Localization Roadmap",
        "Developer Integration Guide for RESTful API Engine",
        "Software Engineering Team Milestones Report",
        "Advanced Data Search & Dynamic Filtering Features",
        "Modern Web Frameworks & Mobile Apps Workshop",
        "Scheduled System Maintenance & Infrastructure Notice",
        "New Mobile Application Release with Speed Boost",
        "Security Audit & Penetration Testing Assessment",
        "Internal Smart Systems Hackathon Winning Teams",
        "Green Energy & Power Optimization in Data Centers",
        "Data Engineering & Analytics Architecture Overview",
        "Technical Support Ticketing Performance Report",
        "Simurgh System Development Roadmap for Next Year",
        "Honoring Top Engineers & Innovators in IT Week"
      ];

      return {
        id,
        title: titles[i % titles.length],
        author_id: (i % 3) + 1,
        author_id_display: i % 3 === 0 ? "Reza Mohammadi" : i % 3 === 1 ? "Sara Ahmadi" : "Ali Kazemi",
        category_ids: [(i % 4) + 1, ((i + 1) % 4) + 1],
        category_ids_display: i % 2 === 0 ? ["News & Announcements", "Information Technology"] : ["Information Technology", "Events & Conferences"],
        cover_image: i % 2 === 0
          ? "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=350&fit=crop"
          : "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=350&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=350&fit=crop",
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=350&fit=crop"
        ],
        content: `<p>This report contains a comprehensive performance analysis, technical details, and specifications for record #${id} in Simurgh Admin Engine.</p>`,
        published: i % 4 !== 0,
        publish_date: `2026-03-${String((i % 28) + 1).padStart(2, '0')}T10:30:00Z`,
        updated_at: `2026-03-${String((i % 28) + 1).padStart(2, '0')}T11:00:00Z`,
        created_at: `2026-03-${String((i % 28) + 1).padStart(2, '0')}T10:30:00Z`
      };
    }),
    users: Array.from({ length: 25 }, (_, i) => {
      const id = i + 1;
      const names = [
        "Reza Mohammadi", "Sara Ahmadi", "Ali Kazemi", "Maryam Hosseini", "Hossein Rezaei",
        "Zahra Karimi", "Mehdi Abbasi", "Narges Taheri", "Amirhossein Jafari", "Fatemeh Mousavi",
        "Mohammad Rostami", "Elham Sharifi", "Babak Sadeghi", "Nastaran Ghorbani", "Payam Heidari",
        "Somaye Fathi", "Kamran Rahimi", "Parisa Najafi", "Arman Saeedi", "Fereshteh Moradi",
        "Sina Bagheri", "Nahid Khodabandeh", "Danial Mirzaei", "Shiva Soleimani", "Keyvan Amiri"
      ];
      const emails = [
        "reza.mohammadi@example.com", "sara.ahmadi@example.com", "ali.kazemi@example.com", "maryam.hosseini@example.com", "hossein.rezaei@example.com",
        "zahra.karimi@example.com", "mehdi.abbasi@example.com", "narges.taheri@example.com", "amir.jafari@example.com", "fatemeh.mousavi@example.com",
        "m.rostami@example.com", "elham.sharifi@example.com", "babak.sadeghi@example.com", "nastaran.ghorbani@example.com", "payam.heidari@example.com",
        "somaye.fathi@example.com", "kamran.rahimi@example.com", "parisa.najafi@example.com", "arman.saeedi@example.com", "fereshteh.moradi@example.com",
        "sina.bagheri@example.com", "nahid.khodabandeh@example.com", "danial.mirzaei@example.com", "shiva.soleimani@example.com", "keyvan.amiri@example.com"
      ];
      const roles = ['admin', 'editor', 'author', 'user'];
      const avatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces"
      ];

      return {
        id,
        full_name: names[i % names.length],
        email: emails[i % emails.length],
        avatar: avatars[i % avatars.length],
        role: roles[i % roles.length],
        bio: `Senior system engineer and software developer (User #${id}).`,
        is_active: i % 5 !== 0,
        created_at: `2026-0${(i % 3) + 1}-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`,
        updated_at: `2026-0${(i % 3) + 1}-${String((i % 25) + 1).padStart(2, '0')}T10:00:00Z`
      };
    }),
    categories: [
      { id: 1, title: "News & Announcements", slug: "announcements", color_code: "purple" },
      { id: 2, title: "Information Technology", slug: "it-tech", color_code: "blue" },
      { id: 3, title: "Events & Conferences", slug: "events", color_code: "emerald" },
      { id: 4, title: "Sales & Marketing", slug: "sales-marketing", color_code: "amber" }
    ],
    products: [
      {
        id: 1,
        title: "Dedicated Pro Server Model X-900",
        sku: "SH-SRV-900",
        price: 45000000,
        stock: 12,
        specs_json: { weight_kg: 8.5, processor: "Xeon Gold 6330", ram_gb: 128 },
        status: "in_stock",
        updated_at: "2026-03-12T00:00:00Z"
      },
      {
        id: 2,
        title: "27-inch 4K Graphic Monitor",
        sku: "SH-MON-274K",
        price: 18500000,
        stock: 3,
        specs_json: { panel: "IPS 100% sRGB", refresh_hz: 144 },
        status: "low_stock",
        updated_at: "2026-03-11T00:00:00Z"
      }
    ],
    support_tickets: [
      {
        id: 1,
        ticket_number: "TK-8041",
        subject: "Domain Name Change & SSL Setup Request",
        customer_id: 2,
        customer_id_display: "Sara Ahmadi",
        priority: "high",
        details: "<p>Please install the new SSL certificate for the communications subdomain.</p>",
        status: "in_progress",
        updated_at: "2026-03-15T09:12:00Z"
      },
      {
        id: 2,
        ticket_number: "TK-8042",
        subject: "Enterprise Cloud Computing Quotation Inquiry",
        customer_id: 3,
        customer_id_display: "Ali Kazemi",
        priority: "normal",
        details: "<p>Proforma invoice request for 24 concurrent cloud servers.</p>",
        status: "open",
        updated_at: "2026-03-15T11:20:00Z"
      }
    ]
  };

  // Protocol Simulation Middleware
  app.use((req: Request, res: Response, next) => {
    const simError = (req.headers['x-simulate-error'] || req.query.__simulate_error) as string;
    if (simError) {
      if (simError === '401') {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Token missing or session expired (Simulated)' }
        });
      }
      if (simError === '403') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'User role lacks sufficient permissions (Simulated)' }
        });
      }
      if (simError === '429') {
        return res.status(429).json({
          success: false,
          error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded. Retry in 15 seconds (Simulated)' }
        });
      }
      if (simError === '500') {
        return res.status(500).json({
          success: false,
          error: { code: 'SERVER_ERROR', message: 'Internal Server Exception (Simulated)' }
        });
      }
    }
    next();
  });

  const API_PREFIX = process.env.API_PREFIX || '/api/admin';

  // Auth Endpoints
  app.post(`${API_PREFIX}/auth/login`, (req: Request, res: Response) => {
    const { email } = req.body || {};
    const users = database['users'] || [];

    const foundUser = users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
    const user = foundUser || {
      id: 1,
      full_name: 'Reza Mohammadi',
      email: email || 'admin@demo.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
      role: 'admin'
    };

    res.setHeader('Set-Cookie', 'mock_session=logged_in; HttpOnly; Path=/');
    return res.json({
      success: true,
      token: 'mock-jwt-token-v1.5.0-xyz789',
      user
    });
  });

  app.get(`${API_PREFIX}/auth/me`, (req: Request, res: Response) => {
    const hasSession = req.headers.cookie && req.headers.cookie.includes('mock_session=logged_in');
    if (!hasSession) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const users = database['users'] || [];
    const user = users[0] || {
      id: 1,
      full_name: 'Reza Mohammadi',
      email: 'admin@demo.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
      role: 'admin'
    };
    return res.json({
      success: true,
      user
    });
  });

  app.post(`${API_PREFIX}/auth/logout`, (_req: Request, res: Response) => {
    res.setHeader('Set-Cookie', 'mock_session=; HttpOnly; Path=/; Max-Age=0');
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  app.put(`${API_PREFIX}/auth/password`, (req: Request, res: Response) => {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Current and new password are required.' }
      });
    }
    return res.json({ success: true, message: 'Password updated successfully' });
  });

  // Protocol Schema Manifest Handshake Endpoint
  app.get(`${API_PREFIX}/schema`, (_req: Request, res: Response) => {
    res.json(activeSchema);
  });

  // Helper resolver to match resource by name/plural_name/path
  const findResource = (pathKey: string): ResourceMeta | undefined => {
    return activeSchema.resources.find(
      r =>
        r.api_path === `${API_PREFIX}/${pathKey}` ||
        r.plural_name === pathKey ||
        r.name === pathKey
    );
  };

  // Export Endpoint (CSV / JSON)
  app.get(`${API_PREFIX}/:resource/export`, (req: Request, res: Response) => {
    const { resource } = req.params;
    const format = (req.query.format as string) || 'csv';
    const resourceMeta = findResource(resource);
    const dbKey = resourceMeta?.plural_name || resource;
    const records = database[dbKey] || [];

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${dbKey}_export.json"`);
      return res.send(JSON.stringify(records, null, 2));
    }

    let csvContent = '';
    if (records.length > 0) {
      const headers = Object.keys(records[0]);
      csvContent += headers.join(',') + '\n';
      records.forEach(r => {
        const row = headers.map(h => {
          const val = r[h];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvContent += row.join(',') + '\n';
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${dbKey}_export.csv"`);
    res.send('\uFEFF' + csvContent);
  });

  // Dynamic CRUD Endpoints
  app.get(`${API_PREFIX}/:resource`, (req: Request, res: Response) => {
    const { resource } = req.params;
    const resourceMeta = findResource(resource);
    const dbKey = resourceMeta?.plural_name || resource;
    const records = database[dbKey] || [];

    let filtered = [...records];
    const { search, page = '1', per_page = '10', sort } = req.query;

    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item => {
        return Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchLower)
        );
      });
    }

    const sortParam = (sort && typeof sort === 'string' && sort.trim() !== '') ? sort : (resourceMeta?.default_sort || 'id');
    const isDesc = sortParam.startsWith('-');
    const field = isDesc ? sortParam.substring(1) : sortParam;
    filtered.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDesc ? valB - valA : valA - valB;
      }

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(per_page as string, 10) || 10;
    const total = filtered.length;
    const lastPage = Math.ceil(total / limitNum) || 1;
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.json({
      success: true,
      data: paginated,
      meta: {
        total,
        page: pageNum,
        per_page: limitNum,
        last_page: lastPage
      }
    });
  });

  app.post(`${API_PREFIX}/:resource`, (req: Request, res: Response) => {
    const { resource } = req.params;
    const resourceMeta = findResource(resource);
    const dbKey = resourceMeta?.plural_name || resource;

    if (!database[dbKey]) {
      database[dbKey] = [];
    }

    const list = database[dbKey];
    const newId = list.length > 0 ? Math.max(...list.map(i => i.id || 0)) + 1 : 1;
    const now = new Date().toISOString();

    const newRecord = {
      id: newId,
      ...req.body,
      updated_at: now,
      created_at: now
    };

    list.unshift(newRecord);
    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'رکورد با موفقیت ایجاد گردید.'
    });
  });

  app.put(`${API_PREFIX}/:resource/:id`, (req: Request, res: Response) => {
    const { resource, id } = req.params;
    const resourceMeta = findResource(resource);
    const dbKey = resourceMeta?.plural_name || resource;
    const list = database[dbKey] || [];
    const numId = parseInt(id, 10);
    const idx = list.findIndex(i => i.id === numId);

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Record #${id} not found` }
      });
    }

    const currentRecord = list[idx];
    const clientConcurrencyVal = req.headers['if-match'] || req.body.__concurrency_token || req.body.updated_at;

    // OCC Check
    if (clientConcurrencyVal && currentRecord.updated_at) {
      const serverToken = String(currentRecord.updated_at).trim();
      const clientToken = String(clientConcurrencyVal).trim();
      if (serverToken !== clientToken) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONCURRENCY_CONFLICT',
            message: 'Optimistic Concurrency Control Conflict',
            server_data: currentRecord,
            client_data: req.body
          }
        });
      }
    }

    const updatedRecord = {
      ...currentRecord,
      ...req.body,
      updated_at: new Date().toISOString()
    };

    list[idx] = updatedRecord;
    res.json({
      success: true,
      data: updatedRecord,
      message: 'رکورد با موفقیت به‌روزرسانی شد.'
    });
  });

  app.delete(`${API_PREFIX}/:resource/:id`, (req: Request, res: Response) => {
    const { resource, id } = req.params;
    const resourceMeta = findResource(resource);
    const dbKey = resourceMeta?.plural_name || resource;
    const list = database[dbKey] || [];
    const numId = parseInt(id, 10);
    const idx = list.findIndex(i => i.id === numId);

    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Record #${id} not found` }
      });
    }

    list.splice(idx, 1);
    res.json({
      success: true,
      message: 'رکورد با موفقیت حذف گردید.'
    });
  });

  // Attach Vite Dev Server Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vue3 Dashboard Test Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
