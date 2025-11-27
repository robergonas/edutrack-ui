import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle, faArrowLeft, faHome } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../../features/auth/service/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="icon-wrapper">
          <fa-icon [icon]="faExclamationTriangle" class="warning-icon"></fa-icon>
        </div>

        <h1 class="title">Acceso Denegado</h1>

        <p class="message">No tienes permisos para acceder a esta página.</p>

        <div class="user-info" *ngIf="currentUser">
          <p>
            <strong>Usuario:</strong> {{ currentUser.fullName }}<br />
            <strong>Rol:</strong> {{ currentUser.role }}
          </p>
        </div>

        <div class="actions">
          <button class="btn btn-primary" (click)="goBack()" type="button">
            <fa-icon [icon]="faArrowLeft"></fa-icon>
            Volver
          </button>

          <button class="btn btn-secondary" (click)="goToDashboard()" type="button">
            <fa-icon [icon]="faHome"></fa-icon>
            Ir al Dashboard
          </button>
        </div>

        <p class="help-text">
          Si crees que deberías tener acceso a esta página, contacta con el administrador del
          sistema.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .unauthorized-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
      }

      .unauthorized-content {
        background: white;
        border-radius: 1rem;
        padding: 3rem 2rem;
        max-width: 500px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .icon-wrapper {
        margin-bottom: 2rem;
      }

      .warning-icon {
        font-size: 5rem;
        color: #f59e0b;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
      }

      .title {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 1rem;
      }

      .message {
        font-size: 1.125rem;
        color: #6b7280;
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }

      .user-info {
        background: #f3f4f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 2rem;
        text-align: left;
      }

      .user-info p {
        margin: 0;
        color: #374151;
        font-size: 0.875rem;
        line-height: 1.8;
      }

      .user-info strong {
        color: #1f2937;
        font-weight: 600;
      }

      .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 1.5rem;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
      }

      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }

      .btn-secondary:hover {
        background: #e5e7eb;
        transform: translateY(-2px);
      }

      .help-text {
        font-size: 0.875rem;
        color: #9ca3af;
        font-style: italic;
        margin: 0;
      }

      @media (max-width: 640px) {
        .unauthorized-content {
          padding: 2rem 1.5rem;
        }

        .title {
          font-size: 1.5rem;
        }

        .message {
          font-size: 1rem;
        }

        .actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class UnauthorizedComponent {
  faExclamationTriangle = faExclamationTriangle;
  faArrowLeft = faArrowLeft;
  faHome = faHome;
  currentUser: any;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  goBack(): void {
    window.history.back();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
