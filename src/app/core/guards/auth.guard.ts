import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../features/auth/service/auth.service';

/**
 * Guard funcional para proteger rutas que requieren autenticación
 * Uso en routes: canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    console.log('Usuario no autenticado. Redirigiendo al login...');
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Verificar rol si es requerido
  const requiredRole = route.data['role'];
  if (requiredRole) {
    const hasRole = authService.hasRole();

    if (!hasRole) {
      console.warn(`Acceso denegado. Se requiere rol: ${requiredRole}`);
      return router.createUrlTree(['/unauthorized']);
    }
  }

  // Verificar múltiples roles si es requerido
  const requiredRoles = route.data['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some((role) => authService.hasRole());

    if (!hasAnyRole) {
      console.warn(`Acceso denegado. Se requiere uno de los roles: ${requiredRoles.join(', ')}`);
      return router.createUrlTree(['/unauthorized']);
    }
  }

  return true;
};

/**
 * Guard funcional para evitar que usuarios autenticados accedan a login
 * Uso en routes: canActivate: [loginGuard]
 */
export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya está autenticado, redirigir al dashboard
  if (authService.isAuthenticated()) {
    console.log('Usuario ya autenticado. Redirigiendo al dashboard...');
    return router.createUrlTree(['/dashboard']);
  }

  // No está autenticado, permitir acceso a login
  return true;
};

/**
 * Guard funcional para verificar permisos específicos
 * Uso en routes: canActivate: [permissionGuard], data: { permission: 'view_students' }
 */
export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar autenticación primero
  if (!authService.isAuthenticated()) {
    console.log('Usuario no autenticado. Redirigiendo al login...');
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Obtener el permiso requerido
  const requiredPermission = route.data['permission'] as string;
  const requiredPermissions = route.data['permissions'] as string[];

  const loginResponse = authService.getCurrentUser();

  if (!loginResponse) {
    return router.createUrlTree(['/login']);
  }

  // Verificar permiso único
  if (requiredPermission) {
    const hasPermission = loginResponse.permissions.length === 0 ? true : false;

    if (hasPermission) {
      console.warn(`Acceso denegado. Se requiere permiso: ${requiredPermission}`);
      return router.createUrlTree(['/unauthorized']);
    }
  }

  // Verificar múltiples permisos (debe tener todos)
  // if (requiredPermissions && requiredPermissions.length > 0) {
  //   const hasAllPermissions =
  //     loginResponse.permissions.includes('all') ||
  //     requiredPermissions.every((permission) => loginResponse.permissions.includes(permission));

  //   if (!hasAllPermissions) {
  //     console.warn(`Acceso denegado. Se requieren permisos: ${requiredPermissions.join(', ')}`);
  //     return router.createUrlTree(['/unauthorized']);
  //   }
  // }

  return true;
};

/**
 * Guard funcional para roles de administrador
 * Uso en routes: canActivate: [adminGuard]
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    console.log('Usuario no autenticado. Redirigiendo al login...');
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (!authService.hasRole()) {
    console.warn('Acceso denegado. Se requiere rol de Administrador');
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};

/**
 * Guard funcional para roles de profesor
 * Uso en routes: canActivate: [teacherGuard]
 */
export const teacherGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  const hasRole = authService.hasRole() || authService.hasRole();

  if (!hasRole) {
    console.warn('Acceso denegado. Se requiere rol de Profesor o Administrador');
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};

// ====================================
// GUARDS DE CLASE (Legacy Support)
// Mantener si necesitas compatibilidad con código antiguo
// ====================================

import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Verificar si está autenticado
    if (this.authService.isAuthenticated()) {
      // Verificar rol si es requerido
      const requiredRole = route.data['role'];
      if (requiredRole) {
        const hasRole = this.authService.hasRole();

        if (!hasRole) {
          console.warn(`Acceso denegado. Se requiere rol: ${requiredRole}`);
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      return true;
    }

    // No autenticado, redirigir al login
    console.log('Usuario no autenticado. Redirigiendo al login...');
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
