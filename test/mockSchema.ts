// Reference implementation of Simurgh Protocol v1.6.0 schema manifest for test server
import { RootSchemaPayload } from '../src/types/schema';

export const defaultProtocolSchema: RootSchemaPayload = {
  $schema_version: "1.6.0",
  system: {
    title: {
      fa: "پنل مدیریت سیمرغ",
      en: "Simurgh Panel"
    },
    logo_url: "/simurgh-logo.svg",
    default_locale: "en",
    supported_locales: ["en", "fa"],
    direction: "ltr",
    endpoints: {
      upload: "/api/admin/uploads"
    },
    auth: {
      strategy: "session",
      login_url: "/api/admin/auth/login",
      me_url: "/api/admin/auth/me",
      logout_url: "/api/admin/auth/logout",
      sso_redirect_url: "https://sso.example.com/login?callback=/api/admin/auth/callback",
      "login_fields": [
        { "name": "email", "label": { "en": "Email Address", "fa": "ایمیل یا نام کاربری" }, "placeholder": { "en": "Enter your email or username...", "fa": "ایمیل یا نام کاربری خود را وارد کنید..." }, "type": "text", "required": true },
        { "name": "password", "label": { "en": "Password", "fa": "کلمه عبور" }, "placeholder": { "en": "Enter your password...", "fa": "کلمه عبور خود را وارد کنید..." }, "type": "password", "required": true }
      ]
    },
    custom_fonts: [
      {
        name: "Lalezar",
        url: "https://fonts.gstatic.com/s/lalezar/v14/OpUp1a5dqj36gZ2zXh_WfQ.woff2",
        format: "woff2",
        label: { en: "Lalezar (Title)", fa: "لاله‌زار (عنوان)" }
      },
      {
        name: "Sahel",
        url: "https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@v3.4.0/dist/Sahel.woff2",
        format: "woff2",
        label: { en: "Sahel (Clean)", fa: "ساحل (خوانا)" }
      }
    ],
    custom_font_sizes: [
      {
        size: "15px",
        label: { en: "Medium Fine (15px)", fa: "متوسط ظریف (۱۵px)" }
      },
      {
        size: "20px",
        label: { en: "Sub-heading (20px)", fa: "زیرعنوان (۲۰px)" }
      },
      {
        size: "32px",
        label: { en: "Hero Display (32px)", fa: "تیتر برجسته (۳۲px)" }
      }
    ]
  },
  validation_schema_url: "/schemas/simurgh-protocol-1.6.0.json",
  resources: [
    {
      name: "news_item",
      plural_name: "news",
      title: {
        fa: "اخبار و اطلاعیه‌ها",
        en: "News & Announcements"
      },
      icon: "Newspaper",
      api_path: "/api/admin/news",
      display_in_sidebar: true,
      group: { fa: "مدیریت محتوا", en: "Content Management" },
      order: 1,
      default_sort: "id",
      per_page_default: 10,
      searchable_fields: ["title", "content"],
      sortable_fields: ["id", "title", "created_at", "publish_date"],
      filterable_fields: ["published", "category_ids"],
      concurrency_field: "updated_at",
      audit_fields: {
        created_by: "مدیر ارشد سیستم",
        updated_by: "تیم پشتیبانی فنی",
        created_at: "2026-03-15T10:30:00Z",
        updated_at: "2026-03-15T11:00:00Z"
      },
      permissions: {
        can_view: true,
        can_insert: true,
        can_edit: true,
        can_delete: true,
        can_export: true
      },
      fields: [
        {
          name: "id",
          label: { fa: "شناسه", en: "ID" },
          type: "number",
          primary_key: true,
          auto_increment: true,
          read_only: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: false, column_width: 80, sortable: true }
        },
        {
          name: "title",
          label: { fa: "عنوان خبر", en: "Title" },
          type: "text",
          required: true,
          rules: [{ type: "required", message: "عنوان خبر الزامی است." }],
          ui: { show_in_list: true, show_in_form: true, placeholder: "عنوان خبر را وارد کنید...", sortable: true, searchable: true }
        },
        {
          name: "author_id",
          label: { fa: "نویسنده", en: "Author" },
          type: "foreign_key",
          required: true,
          relation: {
            target_resource: "user",
            display_field: "full_name",
            value_field: "id",
            api_endpoint: "/api/admin/users"
          },
          rules: [{ type: "required", message: "انتخاب نویسنده الزامی است." }],
          ui: { show_in_list: true, show_in_form: true, widget: "select" }
        },
        {
          name: "category_ids",
          label: { fa: "دسته‌بندی‌ها", en: "Categories" },
          type: "multi_select",
          relation: {
            target_resource: "category",
            display_field: "title",
            value_field: "id",
            api_endpoint: "/api/admin/categories"
          },
          rules: [],
          ui: { show_in_list: true, show_in_form: true, widget: "chips" }
        },
        {
          name: "cover_image",
          label: { fa: "تصویر شاخص", en: "Cover Image" },
          type: "image",
          rules: [],
          ui: { show_in_list: true, show_in_form: true, max_file_size_mb: 5 }
        },
        {
          name: "gallery",
          label: { fa: "گالری تصاویر", en: "Gallery" },
          type: "gallery",
          rules: [],
          ui: { show_in_list: false, show_in_form: true, max_files: 5 }
        },
        {
          name: "content",
          label: { fa: "متن کامل خبر", en: "Content" },
          type: "richtext",
          rules: [],
          ui: { show_in_list: false, show_in_form: true, editor_height: 300 }
        },
        {
          name: "published",
          label: { fa: "وضعیت انتشار", en: "Published" },
          type: "boolean",
          default: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: true, widget: "toggle" }
        },
        {
          name: "publish_date",
          label: { fa: "تاریخ انتشار", en: "Publish Date" },
          type: "datetime",
          rules: [],
          ui: { show_in_list: true, show_in_form: true, picker_format: "YYYY-MM-DD HH:mm" }
        },
        {
          name: "updated_at",
          label: { fa: "آخرین به‌روزرسانی", en: "Last Updated" },
          type: "datetime",
          read_only: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: false }
        }
      ]
    },
    {
      name: "user",
      plural_name: "users",
      title: {
        fa: "مدیریت کاربران",
        en: "User Management"
      },
      icon: "Users",
      api_path: "/api/admin/users",
      display_in_sidebar: true,
      group: { fa: "دسترسی‌ها و سیستم", en: "Access & System" },
      order: 2,
      default_sort: "id",
      per_page_default: 10,
      searchable_fields: ["full_name", "email"],
      sortable_fields: ["id", "full_name", "created_at"],
      filterable_fields: ["role", "is_active"],
      concurrency_field: "updated_at",
      audit_fields: {
        created_by: "مدیر ارشد",
        updated_by: "مدیر ارشد",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-03-01T12:00:00Z"
      },
      permissions: {
        can_view: true,
        can_insert: true,
        can_edit: true,
        can_delete: true,
        can_export: true
      },
      fields: [
        {
          name: "id",
          label: { fa: "شناسه", en: "ID" },
          type: "number",
          primary_key: true,
          auto_increment: true,
          read_only: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: false, column_width: 70 }
        },
        {
          name: "full_name",
          label: { fa: "نام و نام خانوادگی", en: "Full Name" },
          type: "text",
          required: true,
          rules: [{ type: "required", message: "نام کاربر الزامی است." }],
          ui: { show_in_list: true, show_in_form: true, sortable: true, searchable: true }
        },
        {
          name: "email",
          label: { fa: "پست الکترونیکی", en: "Email Address" },
          type: "text",
          required: true,
          rules: [
            { type: "required", message: "ایمیل الزامی است." },
            { type: "email", message: "فرمت ایمیل نامعتبر است." }
          ],
          ui: { show_in_list: true, show_in_form: true, sortable: true, searchable: true }
        },
        {
          name: "avatar",
          label: { fa: "تصویر پروفایل", en: "Avatar" },
          type: "image",
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "role",
          label: { fa: "نقش کاربری", en: "User Role" },
          type: "select",
          required: true,
          options: [
            { label: { fa: "مدیر ارشد (Admin)", en: "Admin" }, value: "admin" },
            { label: { fa: "ویرایشگر (Editor)", en: "Editor" }, value: "editor" },
            { label: { fa: "نویسنده (Author)", en: "Author" }, value: "author" },
            { label: { fa: "کاربر عادی (User)", en: "User" }, value: "user" }
          ],
          rules: [{ type: "required", message: "انتخاب نقش الزامی است." }],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "bio",
          label: { fa: "بیوگرافی", en: "Biography" },
          type: "textarea",
          rules: [],
          ui: { show_in_list: false, show_in_form: true }
        },
        {
          name: "is_active",
          label: { fa: "حساب فعال", en: "Is Active" },
          type: "boolean",
          default: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        }
      ]
    },
    {
      name: "category",
      plural_name: "categories",
      title: {
        fa: "دسته‌بندی‌ها",
        en: "Categories"
      },
      icon: "Folder",
      api_path: "/api/admin/categories",
      display_in_sidebar: true,
      group: { fa: "مدیریت محتوا", en: "Content Management" },
      order: 3,
      default_sort: "id",
      per_page_default: 10,
      searchable_fields: ["title", "slug"],
      sortable_fields: ["id", "title"],
      filterable_fields: [],
      concurrency_field: "id",
      audit_fields: {
        created_by: "سیستم",
        updated_by: "سیستم",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z"
      },
      permissions: {
        can_view: true,
        can_insert: true,
        can_edit: true,
        can_delete: true,
        can_export: false
      },
      fields: [
        {
          name: "id",
          label: { fa: "شناسه", en: "ID" },
          type: "number",
          primary_key: true,
          auto_increment: true,
          read_only: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: false }
        },
        {
          name: "title",
          label: { fa: "عنوان دسته‌بندی", en: "Category Title" },
          type: "text",
          required: true,
          rules: [{ type: "required", message: "عنوان دسته‌بندی الزامی است." }],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "slug",
          label: { fa: "نام مستعار (Slug)", en: "Slug" },
          type: "text",
          required: true,
          rules: [{ type: "required", message: "اسلاگ الزامی است." }],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "color_code",
          label: { fa: "کد رنگ", en: "Color Code" },
          type: "select",
          options: [
            { label: { fa: "بنفش", en: "Purple" }, value: "purple" },
            { label: { fa: "آبی", en: "Blue" }, value: "blue" },
            { label: { fa: "زمردی", en: "Emerald" }, value: "emerald" },
            { label: { fa: "کهربایی", en: "Amber" }, value: "amber" }
          ],
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        }
      ]
    },
    {
      name: "product",
      plural_name: "products",
      title: {
        fa: "محصولات و تجهیزات",
        en: "Products & Inventory"
      },
      icon: "Package",
      api_path: "/api/admin/products",
      display_in_sidebar: true,
      group: { fa: "تجارت و فروش", en: "Sales & E-Commerce" },
      order: 4,
      default_sort: "id",
      per_page_default: 10,
      searchable_fields: ["title", "sku"],
      sortable_fields: ["id", "price", "stock"],
      filterable_fields: ["status"],
      concurrency_field: "updated_at",
      audit_fields: {
        created_by: "مدیر فروش",
        updated_by: "مدیر انبار",
        created_at: "2026-02-10T10:00:00Z",
        updated_at: "2026-03-12T00:00:00Z"
      },
      permissions: {
        can_view: true,
        can_insert: true,
        can_edit: true,
        can_delete: true,
        can_export: true
      },
      fields: [
        {
          name: "id",
          label: { fa: "شناسه", en: "ID" },
          type: "number",
          primary_key: true,
          auto_increment: true,
          read_only: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: false }
        },
        {
          name: "title",
          label: { fa: "نام محصول", en: "Product Title" },
          type: "text",
          required: true,
          rules: [{ type: "required", message: "نام محصول الزامی است." }],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "sku",
          label: { fa: "شناسه کالا (SKU)", en: "SKU Code" },
          type: "text",
          required: true,
          rules: [{ type: "required", message: "کد SKU الزامی است." }],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "price",
          label: { fa: "قیمت (ریال)", en: "Price (IRR)" },
          type: "number",
          required: true,
          rules: [{ type: "min", value: 0, message: "قیمت نمی‌تواند منفی باشد." }],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "stock",
          label: { fa: "موجودی انبار", en: "Stock Quantity" },
          type: "number",
          default: 0,
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "specs_json",
          label: { fa: "مشخصات فنی (JSON)", en: "Technical Specs (JSON)" },
          type: "json",
          rules: [],
          ui: { show_in_list: false, show_in_form: true }
        },
        {
          name: "status",
          label: { fa: "وضعیت موجودی", en: "Stock Status" },
          type: "select",
          options: [
            { label: { fa: "موجود در انبار", en: "In Stock" }, value: "in_stock" },
            { label: { fa: "موجودی محدود", en: "Low Stock" }, value: "low_stock" },
            { label: { fa: "ناموجود", en: "Out of Stock" }, value: "out_of_stock" }
          ],
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        }
      ]
    },
    {
      name: "support_ticket",
      plural_name: "support_tickets",
      title: {
        fa: "تیکت‌های پشتیبانی",
        en: "Support Tickets"
      },
      icon: "LifeBuoy",
      api_path: "/api/admin/support_tickets",
      display_in_sidebar: true,
      group: { fa: "خدمات مشتریان", en: "Customer Support" },
      order: 5,
      default_sort: "id",
      per_page_default: 10,
      searchable_fields: ["ticket_number", "subject"],
      sortable_fields: ["id", "updated_at"],
      filterable_fields: ["status", "priority"],
      concurrency_field: "updated_at",
      audit_fields: {
        created_by: "کاربر خریدار",
        updated_by: "پشتیبانی فنی",
        created_at: "2026-03-14T08:00:00Z",
        updated_at: "2026-03-15T09:12:00Z"
      },
      permissions: {
        can_view: true,
        can_insert: true,
        can_edit: true,
        can_delete: true,
        can_export: true
      },
      fields: [
        {
          name: "id",
          label: { fa: "شناسه", en: "ID" },
          type: "number",
          primary_key: true,
          auto_increment: true,
          read_only: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: false }
        },
        {
          name: "ticket_number",
          label: { fa: "شماره پیگیری", en: "Ticket #" },
          type: "text",
          read_only: true,
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "subject",
          label: { fa: "موضوع درخواست", en: "Subject" },
          type: "text",
          required: true,
          rules: [{ type: "required", message: "موضوع تیکت الزامی است." }],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "customer_id",
          label: { fa: "مشتری", en: "Customer" },
          type: "foreign_key",
          relation: {
            target_resource: "user",
            display_field: "full_name",
            value_field: "id",
            api_endpoint: "/api/admin/users"
          },
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "priority",
          label: { fa: "اولیت بررسی", en: "Priority" },
          type: "select",
          options: [
            { label: { fa: "کم", en: "Low" }, value: "low" },
            { label: { fa: "عادی", en: "Normal" }, value: "normal" },
            { label: { fa: "فوریت بالا", en: "High" }, value: "high" },
            { label: { fa: "بحرانی (Urgent)", en: "Urgent" }, value: "urgent" }
          ],
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "status",
          label: { fa: "وضعیت پاسخ‌گویی", en: "Status" },
          type: "select",
          options: [
            { label: { fa: "باز (Open)", en: "Open" }, value: "open" },
            { label: { fa: "در حال بررسی", en: "In Progress" }, value: "in_progress" },
            { label: { fa: "پاسخ داده شده", en: "Replied" }, value: "replied" },
            { label: { fa: "بسته شده (Closed)", en: "Closed" }, value: "closed" }
          ],
          rules: [],
          ui: { show_in_list: true, show_in_form: true }
        },
        {
          name: "details",
          label: { fa: "توضیحات و سوابق", en: "Ticket Details" },
          type: "richtext",
          rules: [],
          ui: { show_in_list: false, show_in_form: true }
        }
      ]
    }
  ]
};
