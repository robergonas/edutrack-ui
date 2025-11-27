import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DepartmentService } from '../../services/department.service';
import { Department, DepartmentSearchParams } from '../../models/department.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit, OnDestroy {
  departments: Department[] = [];
  loading = false;
  errorMessage = '';

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  // Búsqueda
  searchTerm = '';
  private searchSubject = new Subject<string>();

  // Ordenamiento
  orderBy = 'departmentName';
  orderDirection: 'ASC' | 'DESC' = 'ASC';

  // Unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Configurar búsqueda con debounce
  setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.currentPage = 1;
        this.loadDepartments();
      });
  }

  // Cargar departamentos
  loadDepartments(): void {
    this.loading = true;
    this.errorMessage = '';

    const searchParams: DepartmentSearchParams = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchTerm: this.searchTerm || undefined,
      orderBy: this.orderBy,
      orderDirection: this.orderDirection
    };

    this.departmentService.getAllDepartments(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.departments = response.data.data;
            this.totalRecords = response.data.totalRecords;
            this.totalPages = response.data.totalPages;
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
  }

  // Búsqueda
  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  // Cambiar página
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDepartments();
  }

  // Cambiar tamaño de página
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadDepartments();
  }

  // Ordenar
  onSort(column: string): void {
    if (this.orderBy === column) {
      this.orderDirection = this.orderDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.orderBy = column;
      this.orderDirection = 'ASC';
    }
    this.loadDepartments();
  }

  // Crear departamento
  onCreate(): void {
    this.router.navigate(['/admin/departments/create']);
  }

  // Editar departamento
  onEdit(department: Department): void {
    this.router.navigate(['/admin/departments/edit', department.departmentId]);
  }

  // Ver detalles
  onView(department: Department): void {
    this.router.navigate(['/admin/departments/view', department.departmentId]);
  }

  // Eliminar departamento
  onDelete(department: Department): void {
    if (confirm(`¿Está seguro de eliminar el departamento "${department.departmentName}"?`)) {
      this.loading = true;

      this.departmentService.deleteDepartment(department.departmentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              alert(response.message);
              this.loadDepartments();
            }
          },
          error: (error) => {
            alert(error.message);
            this.loading = false;
          }
        });
    }
  }

  // Limpiar búsqueda
  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }
}
