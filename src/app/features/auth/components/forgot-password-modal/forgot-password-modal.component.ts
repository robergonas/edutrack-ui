import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faEnvelope,
  faTimes,
  faPaperPlane,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { Notyf } from 'notyf';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss'],
})
export class ForgotPasswordModalComponent implements OnInit, OnDestroy {
  // Iconos Font Awesome
  faUser = faUser;
  faEnvelope = faEnvelope;
  faTimes = faTimes;
  faPaperPlane = faPaperPlane;
  faExclamationTriangle = faExclamationTriangle;

  // Formulario
  forgotPasswordForm!: FormGroup;

  // Estados
  loading = false;
  submitted = false;

  // Notificaciones
  private notyf = new Notyf({
    duration: 5000,
    position: { x: 'right', y: 'top' },
    types: [
      {
        type: 'success',
        background: '#10b981',
        icon: {
          className: 'fas fa-check-circle',
          tagName: 'i',
          color: 'white',
        },
      },
      {
        type: 'error',
        background: '#ef4444',
        icon: {
          className: 'fas fa-times-circle',
          tagName: 'i',
          color: 'white',
        },
      },
      {
        type: 'warning',
        background: '#f59e0b',
        icon: {
          className: 'fas fa-exclamation-triangle',
          tagName: 'i',
          color: 'white',
        },
      },
    ],
  });

  // Destrucción de observables
  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicializar formulario
  private initForm(): void {
    this.forgotPasswordForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9._-]+$/),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
    });
  }

  // Obtener mensajes de error
  getErrorMessage(field: string): string {
    const control = this.forgotPasswordForm.get(field);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${field === 'username' ? 'Usuario' : 'Correo electrónico'} es requerido`;
    }

    if (field === 'username') {
      if (control.errors['minlength']) {
        return 'Usuario debe tener al menos 4 caracteres';
      }
      if (control.errors['maxlength']) {
        return 'Usuario no puede exceder 20 caracteres';
      }
      if (control.errors['pattern']) {
        return 'Usuario solo puede contener letras, números, puntos, guiones y guiones bajos';
      }
    }

    if (field === 'email') {
      if (control.errors['email'] || control.errors['pattern']) {
        return 'Correo electrónico inválido';
      }
    }

    return 'Campo inválido';
  }

  // Validar si un campo tiene errores
  hasError(field: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  // Enviar solicitud
  onSubmit(): void {
    // Marcar todos los campos como tocados
    Object.keys(this.forgotPasswordForm.controls).forEach((key) => {
      this.forgotPasswordForm.get(key)?.markAsTouched();
    });

    if (this.forgotPasswordForm.invalid) {
      this.notyf.error('Por favor, complete todos los campos correctamente');
      return;
    }

    this.loading = true;
    this.submitted = true;

    const { username, email } = this.forgotPasswordForm.value;

    this.authService
      .forgotPassword({ username, email })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.notyf.success(response.message);

          // Cerrar modal después de 2 segundos
          setTimeout(() => {
            this.activeModal.close('success');
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.submitted = false;
          this.notyf.error(error.message || 'Error al recuperar contraseña');
        },
      });
  }

  // Cerrar modal
  close(): void {
    this.activeModal.dismiss('cancel');
  }
}
