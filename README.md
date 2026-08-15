<div align="center">
  <img src="public/simurgh-logo.svg" width="200" height="200" alt="Simurgh Panel Logo" />
  <h1>Simurgh Panel</h1>
  <p><strong>Universal, protocol-based frontend admin engine for Vue 3 & Vite — zero frontend coding required for any backend stack.</strong></p>

  [![Vue 3](https://img.shields.io/badge/Vue-3.5-4fc08d.svg?style=flat-square&logo=vuedotjs)](https://vuejs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
</div>

---

## 🚀 Overview

**Simurgh Panel** is a **language-agnostic, universal frontend admin engine** powered by **Vue 3**, **TypeScript**, **Vite**, and **Tailwind CSS**. It implements the **Simurgh Protocol (v1.6.0)** to turn *any* backend stack (Ruby, Python, Go, Node.js, PHP, Rust, etc.) into a fully reactive, modern admin dashboard with **zero frontend coding**.

By decoupling the UI completely from the backend, backend developers simply emit the Simurgh Schema JSON (or use backend adapters such as [`Kabk`](https://github.com/par-taheri/Kabk) / [`Roda-Kabk`](https://github.com/par-taheri/Roda-Kabk) in Ruby), and Simurgh Panel handles all CRUD interfaces, dynamic data tables, forms, validation, RBAC, and internationalization automatically.

---

## ✨ Features

- 🌐 **Language & Backend Agnostic**: Works seamlessly with Ruby, Python (Django/FastAPI), Go, Node.js, PHP (Laravel), Rust, or any REST API server.
- 🔐 **100% Schema-Driven Authentication**: Completely delegates authentication logic (Session Cookies, JWT, or SSO redirects) and UI fields to the backend schema.
- 🛡️ **Built-in XSS Security**: Utilizes `DOMPurify` to heavily sanitize WYSIWYG editor input before rendering or dispatching data.
- ⚡ **Zero-Fetch Embedded Schema Protocol**: Embed your JSON schema directly into HTML via `<script id="simurgh-schema" type="application/json">` for instant 0ms boot times.
- 🎨 **Modern Dark Aesthetics**: Premium UI built with Tailwind CSS, Glassmorphism, smooth micro-animations, and responsive layouts.
- 🌍 **Internationalization (i18n)**: Out-of-the-box support for **English (LTR)** and **Persian (RTL)** with dynamic language switching.
- 📅 **Advanced Date & Time Picker**: Built-in, RTL-aware Persian (Jalali)/Gregorian calendar with smooth view transitions and year/month pagination.
- 📝 **Rich Field Types**: Out-of-the-box support for WYSIWYG editors, JSON editors (with live validation), Dates, single/multi-image uploaders, Link renderers, and Badge fields.
- 📊 **Dynamic Data Engine**: Automated data tables with sorting, searching, advanced filtering UI, pagination, multi-type field renderers (Text, RichText, Images, Badges, Foreign Keys, Links).
- 📥 **Client-Side CSV Export**: Generates and downloads CSV exports entirely in the browser using the current table filters, eliminating backend dependencies.
- 🔒 **Optimistic Concurrency Control (OCC)**: Real-time OCC conflict detection and resolution modal for multi-user data integrity.
- 📦 **Clean Production Bundling**: Bundles all frontend assets into predictable fixed output files (`assets/style.css` & `assets/scripts.js`).
- 🧪 **Isolated Test Server**: Includes an Express mock server in `test/` for local API testing without polluting the production frontend build.

---

## ⚙️ Simurgh Protocol (v1.6.0)

### Global Runtime Configuration
Configure your dynamic API host URL directly in `index.html`:

```html
<script>
  window.APP_CONFIG = {
    baseURL: '' // Optional API host prefix (e.g. 'https://api.example.com' or 'http://localhost:3000')
  };
</script>
```

### Embedded Schema Protocol
Simurgh Panel reads your schema definition embedded directly in `index.html`:

```html
<script id="simurgh-schema" type="application/json">
{
  "$schema_version": "1.6.0",
  "system": {
    "title": { "en": "Simurgh Panel", "fa": "پنل مدیریت سیمرغ" },
    "logo_url": "/simurgh-logo.svg",
    "default_locale": "en",
    "direction": "ltr",
    "auth": {
      "strategy": "session",
      "login_url": "/api/admin/auth/login",
      "me_url": "/api/admin/auth/me",
      "logout_url": "/api/admin/auth/logout",
      "sso_redirect_url": "https://sso.example.com/login?callback=/api/admin/auth/callback",
      "login_fields": [
        { "name": "email", "label": { "en": "Email Address", "fa": "ایمیل" }, "placeholder": { "en": "Enter your email...", "fa": "ایمیل خود را وارد کنید..." }, "type": "text", "required": true },
        { "name": "password", "label": { "en": "Password", "fa": "کلمه عبور" }, "type": "password", "required": true }
      ]
    },
    "endpoints": {
      "upload": "/api/admin/uploads"
    },
    "custom_fonts": [
      { "name": "Lalezar", "url": "https://fonts.gstatic.com/s/lalezar/v14/OpUp1a5dqj36gZ2zXh_WfQ.woff2", "format": "woff2", "label": { "en": "Lalezar", "fa": "لاله‌زار" } }
    ],
    "custom_font_sizes": [
      { "size": "15px", "label": { "en": "Medium (15px)", "fa": "متوسط (۱۵px)" } }
    ]
  },
  "resources": [
    {
      "name": "user",
      "plural_name": "users",
      "title": { "en": "User Management", "fa": "مدیریت کاربران" },
      "icon": "Users",
      "api_path": "/api/admin/users",
      "display_in_sidebar": true,
      "group": { "en": "Access & System", "fa": "دسترسی‌ها و سیستم" },
      "order": 1,
      "permissions": { "can_view": true, "can_insert": true, "can_edit": true, "can_delete": true },
      "fields": [
        { "name": "id", "label": { "en": "ID", "fa": "شناسه" }, "type": "number", "primary_key": true, "read_only": true, "ui": { "show_in_list": true, "show_in_form": false } },
        { "name": "full_name", "label": { "en": "Full Name", "fa": "نام و نام خانوادگی" }, "type": "text", "required": true, "ui": { "show_in_list": true, "show_in_form": true, "sortable": true } },
        { "name": "email", "label": { "en": "Email", "fa": "ایمیل" }, "type": "text", "required": true, "ui": { "show_in_list": true, "show_in_form": true } }
      ]
    },
    {
      "name": "news_item",
      "plural_name": "news",
      "title": { "fa": "اخبار و اطلاعیه‌ها", "en": "News & Announcements" },
      "icon": "Newspaper",
      "api_path": "/api/admin/news",
      "display_in_sidebar": true,
      "group": { "fa": "مدیریت محتوا", "en": "Content Management" },
      "fields": [
        { "name": "title", "label": { "fa": "عنوان خبر", "en": "Title" }, "type": "text", "required": true, "ui": { "show_in_list": true, "show_in_form": true } },
        { "name": "content", "label": { "fa": "متن خبر", "en": "Content" }, "type": "text", "form_type": "wysiwyg", "ui": { "show_in_list": false, "show_in_form": true } },
        { "name": "publish_date", "label": { "fa": "تاریخ انتشار", "en": "Publish Date" }, "type": "date", "form_type": "date", "ui": { "show_in_list": true, "show_in_form": true } }
      ]
    }
  ]
}
</script>
```

---

## 🔗 Ecosystem & Backend Adapters

Simurgh Panel can be paired with official backend engine adapters:

- 💎 **Ruby**: [`Kabk`](https://github.com/par-taheri/Kabk) & [`Roda-Kabk`](https://github.com/par-taheri/Roda-Kabk) — Framework-agnostic Ruby engine & Roda plugin for Simurgh Panel.

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Development Mode
Start the Vite development server:
```bash
npm run dev
```

### 3. Build Static Frontend (Production)
Build the optimized static frontend bundle (`dist/` folder):
```bash
npm run build
```

The output files are generated cleanly in `dist/`:
- `dist/index.html`
- `dist/simurgh-logo.svg`
- `dist/assets/style.css`
- `dist/assets/scripts.js`

### 4. Preview Production Build
Preview the static build locally:
```bash
npm run preview
```

### 5. Run Local Express Test Server
Run the Express mock backend server (with live test API endpoints on `http://localhost:3000`):
```bash
npm run dev:server
```

---

## 📂 Project Structure

```
Simurgh/
├── dist/                   # Production build output
├── public/                 # Static assets (simurgh-logo.svg, etc.)
├── src/                    # Pure Frontend source code (Vue 3, Pinia, TS)
│   ├── components/         # UI Components (Header, Sidebar, DataTable, Modals)
│   ├── services/           # Axios API client & schema validator
│   ├── stores/             # Pinia stores (schema, auth, ui)
│   ├── types/              # TypeScript schema interfaces
│   └── utils/              # i18n & label resolver helpers
├── test/                   # Isolated test server & mock schemas
│   ├── mockSchema.ts       # Sample test protocol schema
│   └── server.ts           # Express mock API server for testing
├── index.html              # Main HTML entry file
├── package.json            # NPM scripts & dependencies
├── vite.config.ts          # Vite & Rollup build configuration
├── LICENSE                 # MIT License
└── README.md               # Documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
