import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PageSizeOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  // Inputs
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 10;
  @Input() loading: boolean = false;

  // Opciones de tamaño de página configurables
  @Input() pageSizeOptions: PageSizeOption[] = [
    { value: 5, label: '5 por página' },
    { value: 10, label: '10 por página' },
    { value: 25, label: '25 por página' },
    { value: 50, label: '50 por página' }
  ];

  // Outputs
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  // Cambiar página
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  // Cambiar tamaño de página
  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  // Obtener array de páginas para mostrar
  getPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
