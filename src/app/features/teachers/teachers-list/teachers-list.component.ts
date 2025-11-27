import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPlus,
  faSearch,
  faFilter,
  faEllipsisV,
  faEdit,
  faTrash,
  faEye,
  faHistory,
  faDownload,
  faCheckCircle,
  faTimesCircle,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { Notyf } from 'notyf';

import { TeachersService } from '../services/teachers.service';
import { DepartmentService } from '../../department/services/department.service';
import { MenuConfigService } from '../../../core/services/menu-config.service';
import {
  TeacherResponse,
  TeacherListFilter,  
  TeacherAction,
} from '../models/teachers.models';
import { Department, DepartmentDropdown } from '../../department/models/department.model';
import { TeacherFormModalComponent } from '../components/teacher-form-modal/teacher-form-modal.component';
import { TeacherDeleteModalComponent } from '../components/teacher-delete-modal/teacher-delete-modal.component';
import { TeacherDetailModalComponent } from '../components/teacher-detail-modal/teacher-detail-modal.component';
import { TeacherHistoryModalComponent } from '../components/teacher-history-modal/teacher-history-modal.component';

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, NgbDropdownModule],
  templateUrl: './teachers-list.component.html',
  styleUrls: ['./teachers-list.component.scss'],
})
export class TeachersListComponent implements OnInit, OnDestroy {
  // Iconos
  faPlus = faPlus;
  faSearch = faSearch;
  faFilter = faFilter;
  faEllipsisV = faEllipsisV;
  faEdit = faEdit;
  faTrash = faTrash;
  faEye = faEye;
  faHistory = faHistory;
  faDownload = faDownload;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faChartBar = faChartBar;

  // Datos
  teachers: TeacherResponse[] = [];
  departments: DepartmentDropdown[] = [];

  // Filtros
  filter: TeacherListFilter = {
    page: 1,
    pageSize: 15,
    status: true,
    departmentId: 0,
    employeeFullName: '',
  };

  // Paginación
  totalCount = 0;
  totalPages = 0;
  pages: number[] = [];

  // Estados
  loading = false;
  showFilters = false;

  // Permisos
  canCreate = false;
  canEdit = false;
  canDelete = false;

  // Notificaciones
  private notyf = new Notyf({
    duration: 4000,
    position: { x: 'right', y: 'top' },
    types: [
      {
        type: 'success',
        background: '#10b981',
        icon: { className: 'fas fa-check-circle', tagName: 'i', color: 'white' },
      },
      {
        type: 'error',
        background: '#ef4444',
        icon: { className: 'fas fa-times-circle', tagName: 'i', color: 'white' },
      },
      {
        type: 'info',
        background: '#3b82f6',
        icon: { className: 'fas fa-info-circle', tagName: 'i', color: 'white' },
      },
    ],
  });

  private destroy$ = new Subject<void>();

  // Exponer Math para el template
  Math = Math;

  constructor(
    private teachersService: TeachersService,
    private departmentService: DepartmentService,
    private menuConfigService: MenuConfigService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
    this.loadDepartments();
    this.loadTeachers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar permisos del usuario
   */
  private loadPermissions(): void {
    const userRoles = this.menuConfigService.getUserRoleNames();
    this.canCreate = userRoles.includes('Administrador');
    this.canEdit = userRoles.includes('Administrador') || userRoles.includes('Secretaria');
    this.canDelete = userRoles.includes('Administrador');
  }

  /**
   * Cargar departamentos para filtros
   */
  private loadDepartments(): void {
    this.departmentService
      .getActiveDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.departments = response.data;
          }
        },
        error: (error) => {
          console.error('Error al cargar departamentos:', error);
        },
      });
  }

  /**
   * Cargar lista de profesores
   */
  loadTeachers(): void {
    this.loading = true;
    this.teachersService
      .list(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.teachers = response.items;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.generatePageNumbers();
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.notyf.error('Error al cargar profesores');
          console.error('Error:', error);
        },
      });
  }

  /**
   * Generar números de página para la paginación
   */
  private generatePageNumbers(): void {
    this.pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.filter.page! - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  /**
   * Cambiar página
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.filter.page = page;
      this.loadTeachers();
    }
  }

  /**
   * Aplicar filtros
   */
  applyFilters(): void {
    this.filter.page = 1;
    this.loadTeachers();
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.filter = {
      page: 1,
      pageSize: 15,
      status: undefined,
      departmentId: undefined,
      employeeFullName: '',
    };
    this.loadTeachers();
  }

  /**
   * Toggle mostrar filtros
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Abrir modal de creación
   */
  openCreateModal(): void {
    const modalRef = this.modalService.open(TeacherFormModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.action = TeacherAction.CREATE;

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadTeachers();
          this.notyf.success('Profesor creado exitosamente');
        }
      },
      () => {
        // Modal cerrado sin acción
      }
    );
  }

  /**
   * Abrir modal de edición
   */
  openEditModal(teacher: TeacherResponse): void {
    const modalRef = this.modalService.open(TeacherFormModalComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.action = TeacherAction.EDIT;
    modalRef.componentInstance.teacherId = teacher.teacherId;

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadTeachers();
          this.notyf.success('Profesor actualizado exitosamente');
        }
      },
      () => {
        // Modal cerrado sin acción
      }
    );
  }

  /**
   * Abrir modal de detalles
   */
  openDetailModal(teacher: TeacherResponse): void {
    const modalRef = this.modalService.open(TeacherDetailModalComponent, {
      size: 'lg',
    });

    modalRef.componentInstance.teacherId = teacher.teacherId;
  }

  /**
   * Abrir modal de eliminación/activación
   */
  openDeleteModal(teacher: TeacherResponse): void {
    const modalRef = this.modalService.open(TeacherDeleteModalComponent, {
      size: 'md',
      centered: true,
    });

    modalRef.componentInstance.teacher = teacher;

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.loadTeachers();
          const message = teacher.status
            ? 'Profesor desactivado exitosamente'
            : 'Profesor activado exitosamente';
          this.notyf.success(message);
        }
      },
      () => {
        // Modal cerrado sin acción
      }
    );
  }

  /**
   * Abrir modal de historial
   */
  openHistoryModal(teacher: TeacherResponse): void {
    const modalRef = this.modalService.open(TeacherHistoryModalComponent, {
      size: 'xl',
    });

    modalRef.componentInstance.teacherId = teacher.teacherId;
    modalRef.componentInstance.teacherName = teacher.employeeFullName;
  }

  /**
   * Navegar al dashboard
   */
  navigateToDashboard(): void {
    // Implementar navegación al dashboard si es necesario
    console.log('Navegar al dashboard de profesores');
  }

  /**
   * Exportar a PDF
   */
  exportToPdf(): void {
    this.loading = true;
    this.teachersService
      .exportToPdf(this.filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `profesores_${new Date().getTime()}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.loading = false;
          this.notyf.success('PDF descargado exitosamente');
        },
        error: (error) => {
          this.loading = false;
          this.notyf.error('Error al exportar PDF');
          console.error('Error:', error);
        },
      });
  }

  /**
   * Obtener iniciales del nombre
   */
  getInitials(fullName: string): string {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  /**
   * Obtener color del avatar basado en el nombre
   */
  getAvatarColor(fullName: string): string {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0',
    ];
    const index = fullName.charCodeAt(0) % colors.length;
    return colors[index];
  }

  /**
   * Formatear fecha
   */
  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
