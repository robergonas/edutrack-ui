# Componente de Paginación Reutilizable

## Descripción
Componente standalone reutilizable para manejar la paginación en listas de datos. Incluye selector de tamaño de página, controles de navegación y visualización del total de registros.

## Ubicación
`src/app/shared/components/pagination/pagination.component.ts`

## Características
- ✅ Selector de tamaño de página configurable
- ✅ Controles de navegación (primera, anterior, siguiente, última página)
- ✅ Visualización de páginas numeradas
- ✅ Indicador de página actual y total de páginas
- ✅ Contador de registros totales
- ✅ Estado de carga (deshabilita controles)
- ✅ Opciones de tamaño de página personalizables

## Uso

### 1. Importar el componente
```typescript
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-mi-lista',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  // ...
})
```

### 2. Agregar en el template
```html
<app-pagination
  [currentPage]="currentPage"
  [totalPages]="totalPages"
  [totalRecords]="totalRecords"
  [pageSize]="pageSize"
  [loading]="loading"
  (pageChange)="onPageChange($event)"
  (pageSizeChange)="onPageSizeChange($event)">
</app-pagination>
```

### 3. Implementar los métodos en el componente
```typescript
export class MiListaComponent {
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  loading = false;

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1; // Resetear a la primera página
    this.loadData();
  }
}
```

## Propiedades de Entrada (@Input)

| Propiedad | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `currentPage` | `number` | Sí | `1` | Página actual |
| `totalPages` | `number` | Sí | `1` | Total de páginas disponibles |
| `totalRecords` | `number` | Sí | `0` | Total de registros |
| `pageSize` | `number` | Sí | `10` | Tamaño de página actual |
| `loading` | `boolean` | No | `false` | Estado de carga (deshabilita controles) |
| `pageSizeOptions` | `PageSizeOption[]` | No | Ver abajo | Opciones de tamaño de página |

### Opciones de tamaño de página por defecto
```typescript
[
  { value: 5, label: '5 por página' },
  { value: 10, label: '10 por página' },
  { value: 25, label: '25 por página' },
  { value: 50, label: '50 por página' }
]
```

### Personalizar opciones de tamaño de página
```html
<app-pagination
  [pageSizeOptions]="customPageSizes"
  ...>
</app-pagination>
```

```typescript
customPageSizes: PageSizeOption[] = [
  { value: 10, label: '10 registros' },
  { value: 20, label: '20 registros' },
  { value: 100, label: '100 registros' }
];
```

## Eventos de Salida (@Output)

| Evento | Tipo | Descripción |
|--------|------|-------------|
| `pageChange` | `EventEmitter<number>` | Emite cuando cambia la página |
| `pageSizeChange` | `EventEmitter<number>` | Emite cuando cambia el tamaño de página |

## Ejemplo Completo

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="container">
      <!-- Barra de búsqueda -->
      <div class="row mb-3">
        <div class="col-md-6">
          <input type="text" class="form-control" placeholder="Buscar...">
        </div>
        <div class="col-md-6">
          <app-pagination
            [currentPage]="currentPage"
            [totalPages]="totalPages"
            [totalRecords]="totalRecords"
            [pageSize]="pageSize"
            [loading]="loading"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)">
          </app-pagination>
        </div>
      </div>

      <!-- Tabla de datos -->
      <table class="table">
        <!-- ... -->
      </table>
    </div>
  `
})
export class StudentsListComponent implements OnInit {
  students: any[] = [];
  loading = false;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    // Llamar al servicio con parámetros de paginación
    this.studentService.getAll({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe(response => {
      this.students = response.data.data;
      this.totalRecords = response.data.totalRecords;
      this.totalPages = response.data.totalPages;
      this.loading = false;
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadStudents();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadStudents();
  }
}
```

## Estilos
El componente incluye estilos básicos con efectos hover y estados disabled. Los estilos son compatibles con Bootstrap 5.

## Notas
- El componente automáticamente oculta los controles de paginación si solo hay una página
- Los botones se deshabilitan automáticamente cuando `loading` es `true`
- La navegación está limitada para prevenir ir a páginas inválidas
