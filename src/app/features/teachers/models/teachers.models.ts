// ==========================================
// MODELOS DE PROFESORES
// ==========================================

export interface CreateTeacherDto {
  employeeId: number;
  specialty?: string;
  degree?: string;
  hireDate: Date;
  status: boolean;
}

export interface UpdateTeacherDto {
  teacherId: number;
  specialty?: string;
  degree?: string;
  hireDate?: Date;
  status?: boolean;
}

export interface TeacherResponse {
  teacherId: number;
  employeeId: number;
  employeeFullName: string;
  specialty?: string;
  degree?: string;
  hireDate: Date;
  status: boolean;
  createdAt: Date;
  updatedAt?: Date;
  departmentId: number;
  departmentName: string;
  positionId: number;
  positionName: string;
}

export interface TeacherListFilter {
  departmentId?: number;
  status?: boolean;
  page?: number;
  pageSize?: number;
  employeeFullName?: string;
}

export interface TeacherListResponse {
  items: TeacherResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// MODELOS DE EMPLEADOS (para dropdown)
// ==========================================

export interface EmployeeOption {
  employeeId: number;
  fullName: string;
  departmentName: string;
  positionName: string;
  isActive?: boolean;
}

// ==========================================
// MODELOS DE AUDITORÍA
// ==========================================

export interface AuditLog {
  auditId: number;
  tableName: string;
  recordId: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  changedColumns?: string;
  oldValues?: string;
  newValues?: string;
  userName?: string;
  userId?: number;
  timestamp: Date;
  deviceInfo?: string;
  sessionId?: number;
}

export interface TeacherAuditHistory {
  auditId: number;
  action: string;
  userName: string;
  timestamp: Date;
  changes: AuditChange[];
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// ==========================================
// MODELOS DE ESTADÍSTICAS
// ==========================================

export interface TeacherStats {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  teachersByDepartment: DepartmentStat[];
  teachersByDegree: DegreeStat[];
  recentHires: TeacherResponse[];
}

export interface DepartmentStat {
  departmentName: string;
  count: number;
  percentage: number;
}

export interface DegreeStat {
  degree: string;
  count: number;
  percentage: number;
}

// ==========================================
// ENUMS
// ==========================================

export enum TeacherAction {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  VIEW = 'VIEW',
}

export const TeacherStatus = {
  ACTIVE: true,
  INACTIVE: false,
} as const;

export type TeacherStatus = typeof TeacherStatus[keyof typeof TeacherStatus];

