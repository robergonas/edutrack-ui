import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  TeacherResponse,
  TeacherListFilter,
  TeacherListResponse,
  EmployeeOption,
  TeacherAuditHistory,
  TeacherStats,
  ApiResponse,
} from '../models/teachers.models';

@Injectable({
  providedIn: 'root',
})
export class TeachersService {
  private apiUrl = `${environment.apiUrl}/teachers`;

  constructor(private http: HttpClient) { }

  /**
   * Crear un nuevo profesor
   */
  create(dto: CreateTeacherDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, dto);
  }

  /**
   * Actualizar un profesor existente
   */
  update(dto: UpdateTeacherDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, dto);
  }

  /**
   * Eliminar (desactivar) un profesor
   */
  delete(teacherId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${teacherId}`);
  }

  /**
   * Activar un profesor
   */
  activate(teacherId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${teacherId}/activate`, {});
  }

  /**
   * Obtener un profesor por ID
   */
  getById(teacherId: number): Observable<TeacherResponse> {
    return this.http.get<TeacherResponse>(`${this.apiUrl}/${teacherId}`);
  }

  /**
   * Listar profesores con filtros y paginación
   */
  list(filter: TeacherListFilter): Observable<TeacherListResponse> {
    let params = new HttpParams();

    if (filter.departmentId !== undefined) {
      params = params.set('departmentId', filter.departmentId.toString());
    }
    if (filter.status !== undefined) {
      params = params.set('status', filter.status.toString());
    }
    if (filter.page) {
      params = params.set('page', filter.page.toString());
    }
    if (filter.pageSize) {
      params = params.set('pageSize', filter.pageSize.toString());
    }
    if (filter.employeeFullName) {
      params = params.set('employeeFullName', filter.employeeFullName);
    }

    return this.http.get<TeacherListResponse>(`${this.apiUrl}/list`, { params });
  }

  /**
   * Obtener lista de empleados disponibles para ser profesores
   */
  getAvailableEmployees(): Observable<ApiResponse<EmployeeOption[]>> {
    return this.http.get<ApiResponse<EmployeeOption[]>>(`${this.apiUrl}/available-employees`);
  }

  /**
   * Obtener historial de auditoría de un profesor
   */
  getAuditHistory(teacherId: number): Observable<TeacherAuditHistory[]> {
    return this.http.get<TeacherAuditHistory[]>(`${this.apiUrl}/${teacherId}/audit-history`);
  }

  /**
   * Obtener estadísticas de profesores
   */
  getStats(): Observable<TeacherStats> {
    return this.http.get<TeacherStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Exportar lista de profesores a PDF
   */
  exportToPdf(filter: TeacherListFilter): Observable<Blob> {
    const dto = {
      departmentId: filter.departmentId || null,
      employeeFullName: filter.employeeFullName || null,
      status: filter.status !== undefined ? filter.status : null,
      page: filter.page || 1,
      pageSize: filter.pageSize || 50
    };

    return this.http.post(`${this.apiUrl}/export_pdf`, dto, {
      responseType: 'blob'
    });
  }
}
