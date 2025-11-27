// src/app/features/department/components/department-view/department-view.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DepartmentService} from '../../services/department.service';
import { Department } from '../../models/department.model';

@Component({
  selector: 'app-department-view',
  templateUrl: './department-view.component.html',
  styleUrls: ['./department-view.component.scss']
})
export class DepartmentViewComponent implements OnInit, OnDestroy {
  department?: Department;
  departmentId!: number;

  // Estados
  loading = false;
  errorMessage = '';
  deleting = false;

  private destroy$ = new Subject<void>();

  constructor(
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.departmentId = +params['id'];
        if (this.departmentId) {
          this.loadDepartment();
        } else {
          this.errorMessage = 'ID de departamento inválido';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar información del departamento
   */
  loadDepartment(): void {
    this.loading = true;
    this.errorMessage = '';

    this.departmentService.getDepartmentById(this.departmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.department = response.data;
          } else {
            this.errorMessage = response.message;
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Navegar a editar
   */
  onEdit(): void {
    this.router.navigate(['/admin/departments/edit', this.departmentId]);
  }

  /**
   * Eliminar departamento
   */
  onDelete(): void {
    if (!this.department) return;

    const confirmMessage = `¿Está seguro de eliminar el departamento "${this.department.departmentName}"?\n\nEsta acción no se puede deshacer y puede afectar registros relacionados.`;

    if (confirm(confirmMessage)) {
      this.deleting = true;

      this.departmentService.deleteDepartment(this.departmentId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              alert(response.message);
              this.router.navigate(['/admin/departments']);
            } else {
              alert(response.message);
              this.deleting = false;
            }
          },
          error: (error) => {
            alert(error.message);
            this.deleting = false;
          }
        });
    }
  }

  /**
   * Volver a la lista
   */
  onBack(): void {
    this.router.navigate(['/admin/departments']);
  }

  /**
   * Refrescar información
   */
  onRefresh(): void {
    this.loadDepartment();
  }

  /**
   * Obtener iniciales del nombre
   */
  getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  /**
   * Formatear fecha relativa
   */
  getRelativeTime(date: Date): string {
    if (!date) return '';

    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  }
}
