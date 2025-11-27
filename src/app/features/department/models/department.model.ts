export interface Department {
  departmentId: number;
  departmentName: string;
  description?: string;
  createdAt: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
}

export interface CreateDepartmentDto {
  departmentName: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  departmentId: number;
  departmentName: string;
  description?: string;
}

export interface DepartmentSearchParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface DepartmentPagedResponse {
  data: Department[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface DepartmentDropdown {
  departmentId: number;
  departmentName: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}
