import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Notyf } from 'notyf';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../service/auth.service';
import { ForgotPasswordModalComponent } from '../forgot-password-modal/forgot-password-modal.component';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, NgbModalModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // Iconos Font Awesome
  faUser = faUser;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faSignInAlt = faSignInAlt;
  faGraduationCap = faGraduationCap;

  // Formulario
  loginForm!: FormGroup;

  // Estados
  loading = false;
  showPassword = false;
  captchaResolved = false;

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

  // Site key de reCAPTCHA (REEMPLAZAR con tu clave real de Google)
  siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRememberedUser();
    this.loadRecaptcha();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicializar formulario
  private initForm(): void {
    this.loginForm = this.fb.group({
      userName: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9._-]+$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
        ],
      ],
      rememberMe: [false],
      recaptcha: ['', Validators.required],
    });
  }

  private loadRecaptcha(): void {
    // Esperar a que el script de Google se cargue
    const interval = setInterval(() => {
      if ((window as any).grecaptcha) {
        clearInterval(interval);
        (window as any).grecaptcha.render('recaptcha-container', {
          sitekey: this.siteKey,
          theme: 'dark',
          callback: (response: string) => {
            this.onCaptchaResolved(response);
          },
        });
      }
    }, 100);
  }

  // Cargar usuario recordado
  private loadRememberedUser(): void {
    const rememberedUser = this.authService.getRememberedUser();
    if (rememberedUser) {
      this.loginForm.patchValue({
        userName: rememberedUser,
        rememberMe: true,
      });
    }
  }

  // Toggle mostrar/ocultar contraseña
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Resolver captcha
  onCaptchaResolved(captchaResponse: string | null): void {
    this.captchaResolved = !!captchaResponse;
    this.loginForm.patchValue({ recaptcha: captchaResponse });
  }

  // Obtener mensajes de error
  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${field === 'userName' ? 'Usuario' : 'Contraseña'} es requerido`;
    }

    if (field === 'userName') {
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

    if (field === 'password') {
      if (control.errors['minlength']) {
        return 'Contraseña debe tener al menos 8 caracteres';
      }
      if (control.errors['pattern']) {
        return 'Contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales';
      }
    }

    return 'Campo inválido';
  }

  // Validar si un campo tiene errores
  hasError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
  //Verificar
  // hasRole(): boolean {
  //const currentUser = this.getCurrentUser();
  //return Array.isArray(currentUser?.userRoles) && currentUser.userRoles.length > 0;
  // }

  // Login
  onSubmit(): void {
    // Marcar todos los campos como tocados para mostrar errores
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });

    if (this.loginForm.invalid) {
      this.notyf.error('Por favor, complete todos los campos correctamente');
      return;
    }

    if (!this.captchaResolved) {
      this.notyf.error('Por favor, complete el captcha');
      return;
    }

    this.loading = true;

    const { userName, password, rememberMe } = this.loginForm.value;

    this.authService
      .login({ userName, password, rememberMe })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (Array.isArray(response.userRoles) && response.userRoles.length === 0) {
            this.notyf.error(`Usuario no tiene rol asignado.`);
            return;
          }

          this.notyf.success(`¡Bienvenido, ${response.employees.fullName}!`);

          // Redirigir según el rol
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error) => {
          this.loading = false;
          this.notyf.error(error.message || 'Error al iniciar sesión');

          // Resetear captcha
          this.captchaResolved = false;
          this.loginForm.patchValue({ recaptcha: '' });
        },
      });
  }

  // Abrir modal "Olvidó su clave"
  openForgotPasswordModal(): void {
    const modalRef = this.modalService.open(ForgotPasswordModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static',
    });

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          // El mensaje ya se muestra desde el modal
        }
      },
      () => {
        // Modal cerrado sin acción
      }
    );
  }

  // Abrir modal "Cambiar contraseña" (solo para usuarios autenticados)
  openChangePasswordModal(): void {
    const modalRef = this.modalService.open(ChangePasswordModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static',
    });

    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          // El mensaje ya se muestra desde el modal
        }
      },
      () => {
        // Modal cerrado sin acción
      }
    );
  }
}
