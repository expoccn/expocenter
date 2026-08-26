export type AccessRole = 'ADMIN' | 'VIEWER';

export interface AuthUser {
  id: string;
  username: string;
  display_name: string;
  role: AccessRole;
  must_change_password: boolean;
}

export interface LoginResponse {
  ok: boolean;
  access_token: string;
  token?: string;
  expires_at: string;
  must_change_password?: boolean;
  user: AuthUser;
}

export interface MeResponse {
  ok: boolean;
  user: AuthUser;
}

export interface LogoutResponse {
  ok: boolean;
  message?: string;
}

export interface ChangePasswordResponse {
  ok: boolean;
  message: string;
}

export interface AdminAccessUser {
  id: string;
  username: string;
  display_name: string;
  role: AccessRole;
  active: boolean;
  must_change_password: boolean;
  created_at: string | null;
  last_login_at?: string | null;
  updated_at?: string | null;
}

export interface AdminUsersResponse {
  ok: boolean;
  users: AdminAccessUser[];
}

export interface AdminCreateUserResponse {
  ok: boolean;
  user: Pick<AdminAccessUser, 'id' | 'username' | 'display_name' | 'role'>;
  temporary_password: string;
  message?: string;
}

export interface AdminUpdateUserResponse {
  ok: boolean;
  user: Pick<AdminAccessUser, 'id' | 'username' | 'display_name' | 'role' | 'active'>;
  message?: string;
}

export interface AdminResetPasswordResponse {
  ok: boolean;
  user_id: string;
  username: string;
  temporary_password: string;
  message?: string;
}
