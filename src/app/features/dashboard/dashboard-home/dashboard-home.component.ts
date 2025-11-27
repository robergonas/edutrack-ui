import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUserGraduate,
  faChalkboardTeacher,
  faBook,
  faMoneyBillWave,
  faChartLine,
  faCalendarCheck,
  faTrophy,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../auth/service/auth.service';
import {
  CurrentUser,
  StatCard,
  QuickAction,
  RecentActivity,
  LoginResponse,
} from '../../../features/auth/models/auth.models';

// interface StatCard {
//   title: string;
//   value: string | number;
//   icon: any;
//   color: string;
//   trend?: string;
//   trendUp?: boolean;
// }

// interface QuickAction {
//   label: string;
//   icon: any;
//   route: string;
//   color: string;
// }

// interface RecentActivity {
//   title: string;
//   description: string;
//   time: string;
//   type: 'success' | 'warning' | 'info' | 'danger';
// }

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: ``,
  styles: [],
})
export class DashboardHomeComponent implements OnInit {
  faUserGraduate = faUserGraduate;
  faChalkboardTeacher = faChalkboardTeacher;
  faBook = faBook;
  faMoneyBillWave = faMoneyBillWave;
  faChartLine = faChartLine;
  faCalendarCheck = faCalendarCheck;
  faTrophy = faTrophy;
  faExclamationTriangle = faExclamationTriangle;

  loginResponse: LoginResponse | null = null;

  stats: StatCard[] = [
    {
      title: 'Total Estudiantes',
      value: 1245,
      icon: faUserGraduate,
      color: '#3b82f6',
      trend: '+5% vs mes anterior',
      trendUp: true,
    },
    {
      title: 'Profesores Activos',
      value: 45,
      icon: faChalkboardTeacher,
      color: '#10b981',
      trend: '+2 nuevos',
      trendUp: true,
    },
    {
      title: 'Cursos',
      value: 32,
      icon: faBook,
      color: '#f59e0b',
    },
    {
      title: 'Pagos Pendientes',
      value: 23,
      icon: faMoneyBillWave,
      color: '#ef4444',
      trend: '-3 vs semana anterior',
      trendUp: false,
    },
  ];

  quickActions: QuickAction[] = [
    {
      label: 'Nuevo Estudiante',
      icon: faUserGraduate,
      route: '/students/create',
      color: '#3b82f6',
    },
    { label: 'Ver Calificaciones', icon: faChartLine, route: '/grades', color: '#10b981' },
    { label: 'Registrar Pago', icon: faMoneyBillWave, route: '/payments', color: '#f59e0b' },
    { label: 'Asistencia', icon: faCalendarCheck, route: '/attendance', color: '#8b5cf6' },
  ];

  recentActivities: RecentActivity[] = [
    {
      title: 'Nuevo estudiante registrado',
      description: 'Juan Pérez - 5to Grado',
      time: 'Hace 5 min',
      type: 'success',
    },
    {
      title: 'Calificaciones actualizadas',
      description: 'Matemáticas - 4to Grado',
      time: 'Hace 1 hora',
      type: 'info',
    },
    {
      title: 'Pago pendiente',
      description: 'María González - Mensualidad',
      time: 'Hace 2 horas',
      type: 'warning',
    },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loginResponse = this.authService.getCurrentUser();
  }
}
