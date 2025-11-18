import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLock,
  faEye,
  faEyeSlash,
  faTimes,
  faCheck,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Notyf } from 'notyf';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
})
export class ChangePasswordModalComponent implements OnInit, OnDestroy {
  // Iconos Font Awesome
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faTimes = faTimes;
  faCheck = faCheck;
  faShieldAlt = faShieldAlt;

  // Formulario
  changePasswordForm!: FormGroup;

  // Estados de visibilidad de contraseñas
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Estado de carga
  loading = false;

  // Fortaleza de la contraseña
  passwordStrength = {
    score: 0,
    label: '',
    color: '',
  };

  // Notificaciones
  private notyf = new Notyf({
    duration: 4000,
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
    this.setupPasswordStrengthListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicializar formulario
  private initForm(): void {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  // Validador personalizado: Las contraseñas deben coincidir
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Configurar listener para la fortaleza de la contraseña
  private setupPasswordStrengthListener(): void {
    this.changePasswordForm
      .get('newPassword')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((password) => {
        this.calculatePasswordStrength(password);
      });
  }

  // Calcular fortaleza de la contraseña
  private calculatePasswordStrength(password: string): void {
    let score = 0;

    if (!password) {
      this.passwordStrength = { score: 0, label: '', color: '' };
      return;
    }

    // Longitud
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Tiene minúsculas
    if (/[a-z]/.test(password)) score += 1;

    // Tiene mayúsculas
    if (/[A-Z]/.test(password)) score += 1;

    // Tiene números
    if (/\d/.test(password)) score += 1;

    // Tiene caracteres especiales
    if (/[@$!%*?&]/.test(password)) score += 1;

    // Determinar label y color
    if (score <= 2) {
      this.passwordStrength = {
        score: (score / 6) * 100,
        label: 'Débil',
        color: '#ef4444',
      };
    } else if (score <= 4) {
      this.passwordStrength = {
        score: (score / 6) * 100,
        label: 'Media',
        color: '#f59e0b',
      };
    } else {
      this.passwordStrength = {
        score: (score / 6) * 100,
        label: 'Fuerte',
        color: '#10b981',
      };
    }
  }

  // Toggle visibilidad de contraseña
  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  // Obtener mensajes de error
  getErrorMessage(field: string): string {
    const control = this.changePasswordForm.get(field);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      if (field === 'currentPassword') return 'Contraseña actual es requerida';
      if (field === 'newPassword') return 'Nueva contraseña es requerida';
      if (field === 'confirmPassword') return 'Debe confirmar la contraseña';
    }

    if (field === 'newPassword') {
      if (control.errors['minlength']) {
        return 'La contraseña debe tener al menos 8 caracteres';
      }
      if (control.errors['pattern']) {
        return 'Debe contener mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&)';
      }
    }

    if (field === 'confirmPassword') {
      if (this.changePasswordForm.errors?.['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }

    return 'Campo inválido';
  }

  // Validar si un campo tiene errores
  hasError(field: string): boolean {
    const control = this.changePasswordForm.get(field);
    const formError = this.changePasswordForm.errors?.['passwordMismatch'];

    if (field === 'confirmPassword' && formError) {
      return !!(control && control.touched);
    }

    return !!(control && control.invalid && control.touched);
  }

  // Enviar formulario
  onSubmit(): void {
    // Marcar todos los campos como tocados
    Object.keys(this.changePasswordForm.controls).forEach((key) => {
      this.changePasswordForm.get(key)?.markAsTouched();
    });

    if (this.changePasswordForm.invalid) {
      this.notyf.error('Por favor, complete todos los campos correctamente');
      return;
    }

    this.loading = true;

    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    // this.authService
    //   .changePassword({ currentPassword, newPassword, confirmPassword })
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response) => {
    //       this.loading = false;
    //       this.notyf.success(response.message);

    //       Cerrar modal después de 1 segundo
    //       setTimeout(() => {
    //         this.activeModal.close('success');
    //       }, 1000);
    //     },
    //     error: (error) => {
    //       this.loading = false;
    //       this.notyf.error(error.message || 'Error al cambiar contraseña');
    //     },
    //   });
  }

  // Validar requisitos de la contraseña
  hasMinLength(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return password.length >= 8;
  }

  hasUpperCase(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return /\d/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return /[@$!%*?&]/.test(password);
  }

  // Cerrar modal
  close(): void {
    this.activeModal.dismiss('cancel');
  }
}
