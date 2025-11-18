import { LoginResponse } from './../auth/models/auth.models';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faTimes,
  faSignOutAlt,
  faUser,
  faChevronDown,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../features/service/auth.service';
import { MenuConfigService, MenuItem } from '../../core/services/menu-config.service';
import { CurrentUser } from '../../features/auth/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './dashboard.component.html', // ✅ CAMBIADO: Ahora apunta al archivo HTML
  styleUrls: ['./dashboard.component.scss'], // ✅ AGREGADO: Referencia al archivo de estilos
})
export class DashboardComponent implements OnInit, OnDestroy {
  faBars = faBars;
  faTimes = faTimes;
  faSignOutAlt = faSignOutAlt;
  faUser = faUser;
  faChevronDown = faChevronDown;
  faChevronRight = faChevronRight;

  isMenuExpanded = false;
  isMobile = false;
  currentUser: any = null; // ✅ CAMBIADO: tipo más flexible
  loginResponse: LoginResponse | null = null;
  menuItems: MenuItem[] = [];
  expandedMenuItems: Set<string> = new Set();
  activeRoute = '';
  loggingOut = false;

  private resizeListener?: () => void;

  constructor(
    private authService: AuthService,
    private menuConfigService: MenuConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🚀 Dashboard ngOnInit');
    this.loadUserData();
    this.loadMenu();
    this.checkScreenSize();
    this.listenToRouteChanges();
    this.addResizeListener();
  }

  ngOnDestroy(): void {
    // Limpiar el listener de resize
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private loadUserData(): void {
    this.loginResponse = this.authService.getCurrentUser();

    if (this.loginResponse) {
      // Construir el objeto currentUser desde loginResponse
      this.currentUser = {
        ...this.loginResponse.employees,
        role: this.getUserRoleName(),
      };
      console.log('✅ Usuario cargado:', this.currentUser);
    } else {
      console.warn('⚠️ No se pudo cargar el usuario');
    }
  }

  private getUserRoleName(): string {
    if (!this.loginResponse?.permissions || this.loginResponse.permissions.length === 0) {
      return 'Usuario';
    }
    return this.loginResponse.permissions[0]?.roleName || 'Usuario';
  }

  private loadMenu(): void {
    console.log('📋 Cargando menú...');
    this.menuItems = this.menuConfigService.getMenuItems();
    console.log('✅ Menú cargado:', this.menuItems.length, 'items');
    console.log('📝 Items del menú:', this.menuItems);

    if (this.menuItems.length === 0) {
      console.error('❌ No hay items en el menú después de filtrar');
    }
  }

  private listenToRouteChanges(): void {
    this.activeRoute = this.router.url;
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
        if (this.isMobile) {
          this.isMenuExpanded = false;
        }
      });
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    console.log('📱 isMobile:', this.isMobile);
  }

  private addResizeListener(): void {
    this.resizeListener = () => {
      this.checkScreenSize();
    };
    window.addEventListener('resize', this.resizeListener);
  }

  toggleMenu(): void {
    this.isMenuExpanded = !this.isMenuExpanded;
    console.log('🔄 Menu toggled:', this.isMenuExpanded);
  }

  toggleSubmenu(itemId: string): void {
    if (this.expandedMenuItems.has(itemId)) {
      this.expandedMenuItems.delete(itemId);
    } else {
      this.expandedMenuItems.add(itemId);
    }
    console.log('🔄 Submenu toggled:', itemId, this.isSubmenuExpanded(itemId));
  }

  isSubmenuExpanded(itemId: string): boolean {
    return this.expandedMenuItems.has(itemId);
  }

  navigateTo(route: string, hasChildren: boolean = false): void {
    if (!hasChildren) {
      console.log('🔗 Navegando a:', route);
      this.router.navigate([route]);
      if (this.isMobile) {
        this.isMenuExpanded = false;
      }
    }
  }

  isRouteActive(route: string): boolean {
    return this.activeRoute === route || this.activeRoute.startsWith(route + '/');
  }

  logout(): void {
    const userName = this.currentUser?.fullName || 'Usuario';
    const confirmed = confirm(`${userName}, ¿está seguro que desea cerrar sesión?`);

    if (confirmed) {
      this.loggingOut = true;
      console.log('👋 Cerrando sesión...');

      // Llamar al método de logout del servicio
      this.authService.logout();

      // El servicio redirige automáticamente
      setTimeout(() => {
        this.loggingOut = false;
      }, 100);
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    else if (hour >= 12 && hour < 19) return 'Buenas tardes';
    else return 'Buenas noches';
  }

  getUserInitials(): string {
    const fullName = this.currentUser?.fullName || this.loginResponse?.employees?.fullName;

    if (!fullName) return '?';

    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getBadgeClass(color?: string): string {
    switch (color) {
      case 'success':
        return 'badge-success';
      case 'warning':
        return 'badge-warning';
      case 'danger':
        return 'badge-danger';
      case 'info':
        return 'badge-info';
      default:
        return 'badge-primary';
    }
  }
}
