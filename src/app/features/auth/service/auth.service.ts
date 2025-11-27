import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  CurrentUser,
  UserEffectivePermissions,
  DecodedToken,
  ForgotPasswordRequest,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //private readonly TOKEN_KEY = 'edutrack_token';
  private readonly CURRENT_USER = 'edutrack_current_user';
  // private readonly REFRESH_TOKEN_KEY = 'edutrack_refresh_token';
  // private readonly EMPLOYEE_KEY = 'edutrack_employees';
  private readonly REMEMBER_USER_KEY = 'edutrack_remember_user';
  // private readonly REMEMBER_USER_ROLES = 'edutrack_users_roles';
  // private readonly REMEMBER_USERID = 'edutrack_userId';
  // private readonly USER_PERMISSIONS = 'edutrack_user_permissions';
  private readonly API_URL = environment.apiUrl;

  private currentUserSubject: BehaviorSubject<LoginResponse | null>;
  //private currentUserIDSubject: BehaviorSubject<string>;
  //private currentUserPermissiondSubject: BehaviorSubject<UserEffectivePermissions | null>;
  //public currentUser$: Observable<CurrentUser | null>;

  private isAuthenticatingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAuthenticating$ = this.isAuthenticatingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem(this.CURRENT_USER);
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(
      storedUser ? JSON.parse(storedUser) : null
    );

    // const storedUserID = localStorage.getItem(this.REMEMBER_USERID);
    // this.currentUserIDSubject = new BehaviorSubject<string>(
    //   storedUserID ? JSON.parse(storedUserID) : null
    // );

    // const storedUserPermissions = localStorage.getItem(this.USER_PERMISSIONS);
    // this.currentUserPermissiondSubject = new BehaviorSubject<UserEffectivePermissions | null>(
    //   storedUserPermissions ? JSON.parse(storedUserPermissions) : null
    // );

    //this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Obtener el usuario actual
  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  // Verificar si el usuario está autenticado
  public isAuthenticated(): boolean {
    const loginResponse = this.getCurrentUser();
    const token = loginResponse?.accessToken;
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * obtener id del usuario
   *
   */
  // getCurrentUserID(): string {
  //   return this.currentUserIDSubject.value;
  // }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(): boolean {
    const loginResponse = this.getCurrentUser();
    return Array.isArray(loginResponse?.userRoles) && loginResponse.userRoles.length > 0;
  }

  /**
   * Login - Consume el API real
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    this.isAuthenticatingSubject.next(true);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, request, { headers }).pipe(
      tap((response) => {
        // Guardar la sesión
        this.setSession(response, request.rememberMe);
        this.currentUserSubject.next(response);
        //this.currentUserIDSubject.next(response.userID);
        //this.currentUserPermissiondSubject.next(response.permissions);
        this.isAuthenticatingSubject.next(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.isAuthenticatingSubject.next(false);
        return throwError(() => this.handleError(error));
      })
    );
  }

  /**
   * Olvidó su contraseña
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http
      .post<{ message: string }>(`${this.API_URL}/auth/forgot-password`, request, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Cambiar contraseña
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    const loginResponse = this.getCurrentUser();
    const accessToken = loginResponse?.accessToken;

    if (!accessToken) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    const request = {
      userID: loginResponse?.userID,
      currentPassword,
      newPassword
    };

    return this.http
      .post<{ message: string }>(`${this.API_URL}/auth/change-password`, request, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Refrescar token
   */
  refreshToken(): Observable<LoginResponse> {
    const loginResponse = this.getCurrentUser();
    const refreshToken = loginResponse?.refreshToken;

    if (!refreshToken) {
      return throwError(() => new Error('No hay token de refresco disponible'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/refresh-token`, { refreshToken }, { headers })
      .pipe(
        tap((response) => {
          this.setSession(response, true);
          this.currentUserSubject.next(response);
        }),
        catchError((error: HttpErrorResponse) => {
          this.logout();
          return throwError(() => this.handleError(error));
        })
      );
  }
  /**
   * Cerrar sesión
   */
  logout(): void {
    const loginResponse = this.getCurrentUser();
    const token = loginResponse?.accessToken;
    const refreshToken = loginResponse?.refreshToken; //this.getRefreshToken();
    //const currentUser = this.getCurrentUser();
    const userId = loginResponse?.userID;

    // Llamar al endpoint de logout si existe
    if (token && refreshToken && loginResponse) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      const logoutRequest = {
        userId: userId,
        refreshToken: refreshToken,
      };

      this.http.post(`${this.API_URL}/auth/logout`, logoutRequest, { headers }).subscribe({
        next: () => {
          console.log('Sesión cerrada en el servidor');
        },
        error: (error) => {
          console.error('Error al cerrar sesión en el servidor', error);
          // Limpiar sesión local incluso si hay error en el servidor
        },
      });
    }
    // Limpiar almacenamiento local
    //localStorage.removeItem(this.TOKEN_KEY);
    // localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    // localStorage.removeItem(this.EMPLOYEE_KEY);
    // localStorage.removeItem(this.REMEMBER_USERID);
    // localStorage.removeItem(this.REMEMBER_USER_ROLES);
    localStorage.removeItem(this.REMEMBER_USER_KEY);
    localStorage.removeItem(this.CURRENT_USER);

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Obtener token
  // getToken(): string | null {
  //   return localStorage.getItem(this.TOKEN_KEY);
  // }

  // Obtener refresh token
  // getRefreshToken(): string | null {
  //   return localStorage.getItem(this.CURRENT_USER);
  // }

  // Obtener usuario recordado
  getRememberedUser(): string | null {
    return localStorage.getItem(this.REMEMBER_USER_KEY);
  }
  /**
   * Guardar sesión
   */
  private setSession(response: LoginResponse, rememberMe: boolean): void {
    localStorage.setItem(this.CURRENT_USER, JSON.stringify(response));
    //localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    //localStorage.setItem(this.REMEMBER_USERID, response.userID);

    // if (response.refreshToken) {
    //   localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    // }

    //localStorage.setItem(this.EMPLOYEE_KEY, JSON.stringify(response.employees));
    //localStorage.setItem(this.REMEMBER_USER_ROLES, JSON.stringify(response.userRoles));

    if (rememberMe) {
      localStorage.setItem(this.REMEMBER_USER_KEY, response.employees.fullName);
    } else {
      localStorage.removeItem(this.REMEMBER_USER_KEY);
    }
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: HttpErrorResponse): Error {
    let errorMessage = 'Error al procesar la solicitud';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          break;
        case 400:
          errorMessage =
            error.error?.message || 'Datos inválidos. Verifique la información ingresada.';
          break;
        case 401:
          errorMessage = error.error?.message || 'Usuario o contraseña incorrectos';
          break;
        case 403:
          errorMessage = 'No tiene permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Servicio no encontrado. Contacte al administrador.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Los datos enviados no son válidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente nuevamente más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible temporalmente';
          break;
        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error completo:', error);
    return new Error(errorMessage);
  }
}
