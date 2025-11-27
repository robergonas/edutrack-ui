import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faSave,
  faUser,
  faGraduationCap,
  faCertificate,
  faCalendar,
  faToggleOn,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { Notyf } from 'notyf';

import { TeachersService } from '../../services/teachers.service';
import { TeacherAction, EmployeeOption } from '../../models/teachers.models';

@Component({
  selector: 'app-teacher-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './teacher-form-modal.component.html',
  styleUrls: ['./teacher-form-modal.component.scss'],
})
export class TeacherFormModalComponent implements OnInit, OnDestroy {
  @Input() action: TeacherAction = TeacherAction.CREATE;
  @Input() teacherId?: number;

  // Iconos
  faTimes = faTimes;
  faSave = faSave;
  faUser = faUser;
  faGraduationCap = faGraduationCap;
  faCertificate = faCertificate;
  faCalendar = faCalendar;
  faToggleOn = faToggleOn;

  // Formulario
  teacherForm!: FormGroup;

  // Datos
  employees: EmployeeOption[] = [];

  // Estados
  loading = false;
  loadingEmployees = false;

  // Fechas
  maxDate: string;
  today: string;

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
    ],
  });

  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private teachersService: TeachersService
  ) {
    // Configurar fecha máxima (hoy)
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.maxDate = this.today;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadAvailableEmployees();

    if (this.action === TeacherAction.EDIT && this.teacherId) {
      this.loadTeacherData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializar formulario
   */
  private initForm(): void {
    this.teacherForm = this.fb.group({
      employeeId: [null, [Validators.required]],
      specialty: ['', [Validators.maxLength(100)]],
      degree: ['', [Validators.maxLength(100)]],
      hireDate: [this.today, [Validators.required]],
      status: [true, [Validators.required]],
    });
  }

  /**
   * Cargar empleados disponibles
   */
  private loadAvailableEmployees(): void {
    this.loadingEmployees = true;
    this.teachersService
      .getAvailableEmployees()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.employees = response.data;
          this.loadingEmployees = false;
        },
        error: (error) => {
          this.loadingEmployees = false;
          console.error('Error al cargar empleados:', error);
          this.notyf.error('Error al cargar empleados disponibles');
        },
      });
  }

  /**
   * Cargar datos del profesor (modo edición)
   */
  private loadTeacherData(): void {
    this.loading = true;
    this.teachersService
      .getById(this.teacherId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teacher) => {
          this.teacherForm.patchValue({
            employeeId: teacher.employeeId,
            specialty: teacher.specialty,
            degree: teacher.degree,
            hireDate: new Date(teacher.hireDate).toISOString().split('T')[0],
            status: teacher.status,
          });

          // Deshabilitar campo de empleado en modo edición
          this.teacherForm.get('employeeId')?.disable();

          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al cargar profesor:', error);
          this.notyf.error('Error al cargar datos del profesor');
          this.activeModal.dismiss('error');
        },
      });
  }

  /**
   * Validar si un campo tiene errores
   */
  hasError(field: string): boolean {
    const control = this.teacherForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Obtener mensaje de error
   */
  getErrorMessage(field: string): string {
    const control = this.teacherForm.get(field);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      const fieldNames: { [key: string]: string } = {
        employeeId: 'Empleado',
        hireDate: 'Fecha de contratación',
      };
      return `${fieldNames[field] || 'Este campo'} es requerido`;
    }

    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    // Marcar todos los campos como tocados
    Object.keys(this.teacherForm.controls).forEach((key) => {
      this.teacherForm.get(key)?.markAsTouched();
    });

    if (this.teacherForm.invalid) {
      this.notyf.error('Por favor, complete todos los campos requeridos');
      return;
    }

    this.loading = true;

    const formValue = this.teacherForm.getRawValue();

    if (this.action === TeacherAction.CREATE) {
      this.createTeacher(formValue);
    } else {
      this.updateTeacher(formValue);
    }
  }

  /**
   * Crear profesor
   */
  private createTeacher(formValue: any): void {
    const dto = {
      employeeId: formValue.employeeId,
      specialty: formValue.specialty || null,
      degree: formValue.degree || null,
      hireDate: new Date(formValue.hireDate),
      status: formValue.status,
    };

    this.teachersService
      .create(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.activeModal.close('success');
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al crear profesor:', error);
          this.notyf.error(error.error?.message || 'Error al crear profesor');
        },
      });
  }

  /**
   * Actualizar profesor
   */
  private updateTeacher(formValue: any): void {
    const dto = {
      teacherId: this.teacherId!,
      specialty: formValue.specialty || null,
      degree: formValue.degree || null,
      hireDate: new Date(formValue.hireDate),
      status: formValue.status,
    };

    this.teachersService
      .update(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.activeModal.close('success');
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al actualizar profesor:', error);
          this.notyf.error(error.error?.message || 'Error al actualizar profesor');
        },
      });
  }

  /**
   * Cerrar modal
   */
  close(): void {
    if (this.teacherForm.dirty) {
      const confirmed = confirm('¿Está seguro que desea cancelar? Los cambios no se guardarán.');
      if (confirmed) {
        this.activeModal.dismiss('cancel');
      }
    } else {
      this.activeModal.dismiss('cancel');
    }
  }

  /**
   * Obtener título del modal
   */
  getTitle(): string {
    return this.action === TeacherAction.CREATE ? 'Nuevo Profesor' : 'Editar Profesor';
  }
}
