// src/app/features/department/services/department.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Department,
  DepartmentSearchParams,
  DepartmentPagedResponse,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentDropdown,
  ApiResponse
} from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los departamentos con paginación y búsqueda
   */
  getAllDepartments(searchParams: DepartmentSearchParams): Observable<ApiResponse<DepartmentPagedResponse>> {
    let params = new HttpParams()
      .set('pageNumber', searchParams.pageNumber.toString())
      .set('pageSize', searchParams.pageSize.toString());

    if (searchParams.searchTerm) {
      params = params.set('searchTerm', searchParams.searchTerm);
    }
    if (searchParams.orderBy) {
      params = params.set('orderBy', searchParams.orderBy);
    }
    if (searchParams.orderDirection) {
      params = params.set('orderDirection', searchParams.orderDirection);
    }

    return this.http.get<ApiResponse<DepartmentPagedResponse>>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener departamento por ID
   */
  getDepartmentById(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Crear nuevo departamento
   */
  createDepartment(department: CreateDepartmentDto): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(this.apiUrl, department)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar departamento
   */
  updateDepartment(department: UpdateDepartmentDto): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.apiUrl}/${department.departmentId}`, department)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar departamento
   */
  deleteDepartment(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtener departamentos activos para dropdown
   */
  getActiveDepartments(): Observable<ApiResponse<DepartmentDropdown[]>> {
    return this.http.get<ApiResponse<DepartmentDropdown[]>>(`${this.apiUrl}/list?isActive=true`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Validar nombre de departamento
   */
  validateDepartmentName(name: string, departmentId?: number): Observable<boolean> {
    let params = new HttpParams().set('departmentName', name);
    if (departmentId) {
      params = params.set('departmentId', departmentId.toString());
    }

    return this.http.get<ApiResponse<{ exists: boolean }>>(`${this.apiUrl}/validate-name`, { params })
      .pipe(
        map(response => response.data.exists),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors.join(', ');
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar con el servidor';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicie sesión';
      } else if (error.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta acción';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else {
        errorMessage = error.message || errorMessage;
      }
    }

    console.error('Error en DepartmentService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
