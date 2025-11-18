import { Injectable } from '@angular/core';
import { AuthService } from '../../features/service/auth.service';
import {
  faHome,
  faUsers,
  faChalkboardTeacher,
  faUserGraduate,
  faMoneyBillWave,
  faClipboardList,
  faChartBar,
  faCog,
  faBook,
  faCalendarAlt,
  faFileAlt,
  faBell,
  faUserCog,
  faBuilding,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { LoginResponse } from '../../features/auth/models/auth.models';

export interface MenuItem {
  id: string;
  label: string;
  icon: IconDefinition;
  route: string;
  permission?: string;
  roles?: string[];
  children?: MenuItem[];
  badge?: string;
  badgeColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MenuConfigService {
  constructor(private authService: AuthService) {}

  private readonly menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: faHome,
      route: '/dashboard',
    },
    {
      id: 'students',
      label: 'Estudiantes',
      icon: faUserGraduate,
      route: '/students',
      permission: 'view_students',
      children: [
        {
          id: 'students-list',
          label: 'Lista de Estudiantes',
          icon: faUsers,
          route: '/students/list',
          permission: 'view_students',
        },
        {
          id: 'students-enrollment',
          label: 'Matrículas',
          icon: faClipboardList,
          route: '/students/enrollment',
          permission: 'manage_enrollment',
        },
        {
          id: 'students-attendance',
          label: 'Asistencia',
          icon: faCalendarAlt,
          route: '/students/attendance',
          permission: 'manage_attendance',
        },
      ],
    },
    {
      id: 'teachers',
      label: 'Profesores',
      icon: faChalkboardTeacher,
      route: '/teachers',
      roles: ['Administrador', 'Secretaria'],
      children: [
        {
          id: 'teachers-list',
          label: 'Lista de Profesores',
          icon: faUsers,
          route: '/teachers/list',
          roles: ['Administrador', 'Secretaria'],
        },
        {
          id: 'teachers-schedule',
          label: 'Horarios',
          icon: faCalendarAlt,
          route: '/teachers/schedule',
          roles: ['Administrador'],
        },
      ],
    },
    {
      id: 'grades',
      label: 'Calificaciones',
      icon: faClipboardList,
      route: '/grades',
      permission: 'manage_grades',
    },
    {
      id: 'courses',
      label: 'Cursos',
      icon: faBook,
      route: '/courses',
      permission: 'view_courses',
      children: [
        {
          id: 'courses-list',
          label: 'Lista de Cursos',
          icon: faBook,
          route: '/courses/list',
          permission: 'view_courses',
        },
        {
          id: 'courses-create',
          label: 'Crear Curso',
          icon: faFileAlt,
          route: '/courses/create',
          roles: ['Administrador'],
        },
      ],
    },
    {
      id: 'payments',
      label: 'Pagos',
      icon: faMoneyBillWave,
      route: '/payments',
      permission: 'register_payments',
      badge: '5',
      badgeColor: 'success',
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: faChartBar,
      route: '/reports',
      permission: 'view_reports',
      children: [
        {
          id: 'reports-academic',
          label: 'Académicos',
          icon: faFileAlt,
          route: '/reports/academic',
          permission: 'view_reports',
        },
        {
          id: 'reports-financial',
          label: 'Financieros',
          icon: faMoneyBillWave,
          route: '/reports/financial',
          permission: 'view_financial_reports',
        },
      ],
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: faBell,
      route: '/notifications',
      badge: 'Nuevo',
      badgeColor: 'warning',
    },
    {
      id: 'administration',
      label: 'Administración',
      icon: faBuilding,
      route: '/administration',
      roles: ['Administrador'],
      children: [
        {
          id: 'admin-users',
          label: 'Usuarios',
          icon: faUserCog,
          route: '/administration/users',
          roles: ['Administrador'],
        },
        {
          id: 'admin-settings',
          label: 'Configuración',
          icon: faCog,
          route: '/administration/settings',
          roles: ['Administrador'],
        },
      ],
    },
  ];

  /**
   * Obtener menú filtrado según permisos y roles del usuario actual
   */
  getMenuItems(): MenuItem[] {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.warn('⚠️ No hay usuario autenticado en MenuConfigService');
      return [];
    }

    console.log('👤 Usuario actual:', currentUser);
    console.log('🔑 Permisos:', currentUser.permissions);
    console.log('👔 Roles (IDs):', currentUser.userRoles);

    return this.filterMenuByPermissions(this.menuItems, currentUser);
  }

  /**
   * Filtrar items del menú recursivamente según permisos y roles
   */
  private filterMenuByPermissions(items: MenuItem[], currentUser: LoginResponse): MenuItem[] {
    return items
      .filter((item) => this.hasAccessToItem(item, currentUser))
      .map((item) => {
        if (item.children) {
          const filteredChildren = this.filterMenuByPermissions(item.children, currentUser);
          return {
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : undefined,
          };
        }
        return item;
      });
  }

  /**
   * Verificar si el usuario tiene acceso a un item específico
   */
  private hasAccessToItem(item: MenuItem, currentUser: LoginResponse): boolean {
    if (!currentUser) {
      console.warn('⚠️ Usuario no definido en hasAccessToItem');
      return false;
    }

    // Si el item no tiene restricciones, es visible para todos
    if (!item.permission && !item.roles) {
      console.log(`✅ Item "${item.label}" sin restricciones - PERMITIDO`);
      return true;
    }

    const userPermissions = Array.isArray(currentUser.permissions) ? currentUser.permissions : [];

    // Verificar si el usuario tiene permiso 'all'
    const hasAllPermission = userPermissions.some(
      (perm) =>
        perm.module?.toLowerCase() === 'all' ||
        perm.accesType?.toLowerCase() === 'all' ||
        perm.permissionDescription?.toLowerCase() === 'all'
    );

    if (hasAllPermission) {
      console.log(`✅ Item "${item.label}" - Usuario tiene permiso 'all'`);
      return true;
    }

    // Verificar permiso específico del item
    if (item.permission) {
      const hasSpecificPermission = userPermissions.some(
        (perm) =>
          perm.module?.toLowerCase() === item.permission?.toLowerCase() ||
          perm.accesType?.toLowerCase() === item.permission?.toLowerCase() ||
          perm.permissionDescription?.toLowerCase().includes(item.permission?.toLowerCase() || '')
      );

      if (hasSpecificPermission) {
        console.log(`✅ Item "${item.label}" - Permiso específico encontrado`);
        return true;
      }
    }

    // Verificar roles por nombre (roleName en permissions)
    if (item.roles && userPermissions.length > 0) {
      const userRoleNames = userPermissions.map((perm) => perm.roleName).filter(Boolean);
      const hasRequiredRole = item.roles.some((requiredRole) =>
        userRoleNames.some((userRole) => userRole?.toLowerCase() === requiredRole.toLowerCase())
      );

      if (hasRequiredRole) {
        console.log(`✅ Item "${item.label}" - Rol encontrado en permissions`);
        return true;
      }
    }

    console.log(`❌ Item "${item.label}" - DENEGADO`);
    return false;
  }

  /**
   * Helper: Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.permissions) {
      return false;
    }

    return currentUser.permissions.some(
      (perm) =>
        perm.module?.toLowerCase() === permission.toLowerCase() ||
        perm.accesType?.toLowerCase() === permission.toLowerCase() ||
        perm.permissionDescription?.toLowerCase().includes(permission.toLowerCase()) ||
        perm.module?.toLowerCase() === 'all'
    );
  }

  /**
   * Helper: Obtener todos los módulos a los que el usuario tiene acceso
   */
  getUserModules(): string[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.permissions) {
      return [];
    }

    const modules = currentUser.permissions
      .map((perm) => perm.module)
      .filter((module) => module && module.toLowerCase() !== 'all');

    return [...new Set(modules)];
  }

  /**
   * Helper: Obtener todos los tipos de acceso del usuario
   */
  getUserAccessTypes(): string[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.permissions) {
      return [];
    }

    const accessTypes = currentUser.permissions
      .map((perm) => perm.accesType)
      .filter((type) => type && type.toLowerCase() !== 'all');

    return [...new Set(accessTypes)];
  }

  /**
   * Helper: Obtener nombres de roles del usuario
   */
  getUserRoleNames(): string[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.permissions) {
      return [];
    }

    const roleNames = currentUser.permissions.map((perm) => perm.roleName).filter((name) => name);

    return [...new Set(roleNames)];
  }

  /**
   * Obtener item del menú por ID
   */
  getMenuItemById(id: string): MenuItem | undefined {
    return this.findMenuItemRecursive(this.menuItems, id);
  }

  private findMenuItemRecursive(items: MenuItem[], id: string): MenuItem | undefined {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = this.findMenuItemRecursive(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  /**
   * Obtener ruta activa del menú
   */
  getActiveMenuItem(currentRoute: string): MenuItem | undefined {
    return this.findActiveMenuItemRecursive(this.menuItems, currentRoute);
  }

  private findActiveMenuItemRecursive(items: MenuItem[], route: string): MenuItem | undefined {
    for (const item of items) {
      if (item.route === route) {
        return item;
      }
      if (item.children) {
        const found = this.findActiveMenuItemRecursive(item.children, route);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }
}
