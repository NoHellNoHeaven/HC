export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'driver';
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}