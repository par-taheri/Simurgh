// TypeScript type definitions for Simurgh Protocol v1.6.0 schema specification
export type LanguageCode = 'fa' | 'en' | string;
export type LocalizedLabel = string | Record<LanguageCode, string>;

export type Direction = 'rtl' | 'ltr';

export interface CustomFontMeta {
  name: string;
  url: string;
  format?: string;
  label: LocalizedLabel;
}

export interface CustomFontSizeMeta {
  size: string;
  label: LocalizedLabel;
}

export interface SystemEndpointsMeta {
  upload?: string;
}

export interface AuthFieldMeta {
  name: string;
  label: LocalizedLabel;
  placeholder?: LocalizedLabel;
  type: string;
  required?: boolean;
}

export interface AuthMeta {
  strategy: 'session' | 'jwt' | 'sso';
  login_url: string;
  me_url: string;
  logout_url: string;
  sso_redirect_url?: string;
  login_fields?: AuthFieldMeta[];
  show_demo_credentials?: boolean;
}

export interface SystemMeta {
  title: LocalizedLabel;
  subtitle?: LocalizedLabel;
  description?: LocalizedLabel;
  logo_url: string;
  default_locale: LanguageCode;
  supported_locales: LanguageCode[];
  direction: Direction;
  endpoints?: SystemEndpointsMeta;
  auth?: AuthMeta;
  custom_fonts?: CustomFontMeta[];
  custom_font_sizes?: CustomFontSizeMeta[];
}

export interface PermissionsMeta {
  can_view?: boolean;
  can_insert?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  can_export?: boolean;
}

export interface AuditFieldsMeta {
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ValidationMeta {
  min_length?: number;
  max_length?: number;
  min?: number;
  max?: number;
  pattern?: string;
  unique?: boolean;
  min_date?: string;
  max_date?: string | null;
  custom_message?: LocalizedLabel;
}

export interface UploadConfig {
  allowed_extensions: string[];
  max_size_mb: number;
}

export interface RelationMeta {
  resource: string;
  cardinality: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
  value_field: string;
  label_field: string;
  display_key?: string;
  fetch_endpoint: string;
  search_param?: string;
  debounce_ms?: number;
  per_page?: number;
}

export interface SelectOption {
  label: LocalizedLabel;
  value: string | number | boolean;
  color?: string;
}

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'file'
  | 'json'
  | 'array'
  | 'relation';

export type FormType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'wysiwyg'
  | 'checkbox'
  | 'switch'
  | 'select'
  | 'multiselect'
  | 'relation_select'
  | 'date'
  | 'datetime'
  | 'image_single'
  | 'image_multi'
  | 'json_editor'
  | 'file';

export type DisplayAs = 'text' | 'badge' | 'thumbnail' | 'link' | 'boolean_icon';

export interface DependsOnCondition {
  field: string;
  value: any;
  logic?: 'AND' | 'OR';
  conditions?: Array<{
    field: string;
    operator?: '==' | '!=' | '>' | '<' | 'in' | 'contains';
    value: any;
  }>;
}

export interface FieldMeta {
  name: string;
  label: LocalizedLabel;
  type: FieldType;
  form_type: FormType;
  calendar?: 'jalali' | 'gregorian';
  primary_key?: boolean;
  nullable?: boolean;
  display_as?: DisplayAs;
  col_width?: number; // Grid column width 1 to 12
  order?: number;
  required?: boolean;
  readonly?: boolean;
  hidden_in_table?: boolean;
  hidden_in_form?: boolean;
  accordion?: boolean;
  rows?: number;
  options?: SelectOption[];
  default_value?: any;
  depends_on?: DependsOnCondition;
  validation?: ValidationMeta;
  relation?: RelationMeta;
  upload_config?: UploadConfig;
}

export interface ResourceMeta {
  name: string;
  plural_name: string;
  title: LocalizedLabel;
  icon: string;
  api_path: string;
  display_in_sidebar?: boolean;
  group?: string;
  order?: number;
  default_sort?: string;
  per_page_default?: number;
  searchable_fields?: string[];
  sortable_fields?: string[];
  filterable_fields?: string[];
  concurrency_field?: string;
  audit_fields?: AuditFieldsMeta;
  permissions?: PermissionsMeta;
  fields: FieldMeta[];
}

export interface RootSchemaPayload {
  $schema_version: string;
  system: SystemMeta;
  validation_schema_url?: string;
  resources: ResourceMeta[];
}

// API Response Envelopes
export interface ListMeta {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface ListResponse<T = Record<string, any>> {
  success: boolean;
  data: T[];
  meta: ListMeta;
}

export interface SingleResponse<T = Record<string, any>> {
  success: boolean;
  message?: string;
  data: T;
}

export interface FieldErrorMap {
  [fieldName: string]: string[];
}

export interface ErrorPayload {
  code:
    | 'VALIDATION_ERROR'
    | 'FILE_TOO_LARGE'
    | 'INVALID_FILE_TYPE'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'CONCURRENCY_CONFLICT'
    | 'RATE_LIMIT_EXCEEDED'
    | 'SERVER_ERROR';
  message: string;
  fields?: FieldErrorMap;
}

export interface ErrorResponse {
  success: false;
  error: ErrorPayload;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    file_name: string;
    size: number;
    mime_type: string;
  };
}

export interface UserSession {
  id: number;
  full_name: string;
  email: string;
  avatar: string;
  role: string;
  permissions?: Array<string | LocalizedLabel>;
  token?: string;
  refresh_token?: string;
}
