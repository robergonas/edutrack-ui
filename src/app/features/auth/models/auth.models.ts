// Modelos de autenticación

export interface LoginRequest {
  userName: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userName: string;
  userRoles: number[];
  employees: Employees;
  userID: number;
  permissions: UserEffectivePermissions[];
}

export interface Employees {
  employeeId: number;
  fullName: string;
  departmentID: number;
  positionID: number;
  hireDate: Date;
  isActive: boolean;
}

export interface CurrentUser {
  employeeid: number;
  departmentId: number;
  positionId: number;
  fullName: string;
  isActive: boolean;
  userRoles: UserRole[];
  permissions: UserEffectivePermissions[];
}

export interface UserEffectivePermissions {
  userId: number;
  userName: string;
  roleName: string;
  module: string;
  accesType: string;
  accessypeId: number;
  permissionDescription: string;
}

export interface UserRole {
  userRoleId: number;
  userId: number;
  roleID: number;
}

export interface DecodedToken {
  sub: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
}

export interface ForgotPasswordRequest {
  username: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
  trendUp?: boolean;
}

export interface QuickAction {
  label: string;
  icon: any;
  route: string;
  color: string;
}

export interface RecentActivity {
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}
