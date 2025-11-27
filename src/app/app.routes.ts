import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ==========================================
  // RUTA RAÍZ - Redirige a login
  // ==========================================
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // ==========================================
  // RUTAS PÚBLICAS (sin autenticación)
  // ==========================================
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then((m) => m.LoginComponent),
    canActivate: [loginGuard],
  },

  // ==========================================
  // PÁGINA DE NO AUTORIZADO
  // ==========================================
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },

  // ==========================================
  // DASHBOARD (protegido)
  // ==========================================
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard-home/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent
          ),
      },
      // ==========================================
      // CAMBIAR CLAVE
      // ==========================================
      {
        path: 'change-password',
        loadComponent: () =>
          import(
            './features/auth/components/change-password-page/change-password-page.component'
          ).then((m) => m.ChangePasswordPageComponent),
      },
      // ==========================================
      // ESTUDIANTES
      // ==========================================
      {
        path: 'students',
        children: [
          {
            path: 'list',
            loadComponent: () =>
              import('./features/students/students-list/students-list.component').then(
                (m) => m.StudentsListComponent
              ),
            data: { permission: 'view_students' },
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/students/student-create/student-create.component').then(
                (m) => m.StudentCreateComponent
              ),
            data: { permission: 'create_students' },
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/students/student-edit/student-edit.component').then(
                (m) => m.StudentEditComponent
              ),
            data: { permission: 'edit_students' },
          },
          {
            path: 'enrollment',
            loadComponent: () =>
              import('./features/students/enrollment/enrollment.component').then(
                (m) => m.EnrollmentComponent
              ),
            data: { permission: 'manage_enrollment' },
          },
          {
            path: 'attendance',
            loadComponent: () =>
              import('./features/students/attendance/attendance.component').then(
                (m) => m.AttendanceComponent
              ),
            data: { permission: 'manage_attendance' },
          },
        ],
      },

      // ==========================================
      // PROFESORES
      // ==========================================
      {
        path: 'teachers',
        children: [
          {
            path: 'list',
            loadComponent: () =>
              import('./features/teachers/teachers-list/teachers-list.component').then(
                (m) => m.TeachersListComponent
              ),
            data: { roles: ['Administrador', 'Secretaria'] },
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/teachers/teachers-list/teachers-list.component').then(
                (m) => m.TeachersListComponent
              ),
            data: { roles: ['Administrador'] },
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/teachers/teachers-list/teachers-list.component').then(
                (m) => m.TeachersListComponent
              ),
            data: { roles: ['Administrador', 'Secretaria'] },
          },
          {
            path: ':id/view',
            loadComponent: () =>
              import('./features/teachers/teachers-list/teachers-list.component').then(
                (m) => m.TeachersListComponent
              ),
            data: { roles: ['Administrador', 'Secretaria'] },
          },
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/teachers/teachers-dashboard/teachers-dashboard.component').then(
                (m) => m.TeachersDashboardComponent
              ),
            data: { roles: ['Administrador'] },
          },
        ],
      },

      // ==========================================
      // CALIFICACIONES
      // ==========================================
      {
        path: 'grades',
        loadComponent: () =>
          import('./features/grades/grades.component').then((m) => m.GradesComponent),
        data: { permission: 'manage_grades' },
      },

      // ==========================================
      // CURSOS
      // ==========================================
      {
        path: 'courses',
        children: [
          {
            path: 'list',
            loadComponent: () =>
              import('./features/courses/courses-list/courses-list.component').then(
                (m) => m.CoursesListComponent
              ),
            data: { permission: 'view_courses' },
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./features/courses/course-create/course-create.component').then(
                (m) => m.CourseCreateComponent
              ),
            data: { roles: ['Administrador'] },
          },
        ],
      },

      // ==========================================
      // PAGOS
      // ==========================================
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payments.component').then((m) => m.PaymentsComponent),
        data: { permission: 'register_payments' },
      },

      // ==========================================
      // REPORTES
      // ==========================================
      {
        path: 'reports',
        children: [
          {
            path: 'academic',
            loadComponent: () =>
              import('./features/reports/academic/academic.component').then(
                (m) => m.AcademicComponent
              ),
            data: { permission: 'view_reports' },
          },
          {
            path: 'financial',
            loadComponent: () =>
              import('./features/reports/financial/financial.component').then(
                (m) => m.FinancialComponent
              ),
            data: { permission: 'view_financial_reports' },
          },
        ],
      },

      // ==========================================
      // NOTIFICACIONES
      // ==========================================
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          ),
      },

      // ==========================================
      // ADMINISTRACIÓN (solo Administrador)
      // ==========================================
      {
        path: 'administration',
        children: [
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/users/users.component').then((m) => m.UsersComponent),
            data: { roles: ['Administrador'] },
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/admin/setting/settings.component').then(
                (m) => m.SettingsComponent
              ),
            data: { roles: ['Administrador'] },
          },
        ],
      },
    ],
  },

  // ==========================================
  // RUTA 404 - No encontrado
  // ==========================================
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
