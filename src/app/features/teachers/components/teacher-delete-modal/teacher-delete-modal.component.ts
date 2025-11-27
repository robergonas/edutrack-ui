import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faExclamationTriangle,
  faCheckCircle,
  faTimes,
  faTrash,
  faToggleOn,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { Notyf } from 'notyf';

import { TeachersService } from '../../services/teachers.service';
import { TeacherResponse } from '../../models/teachers.models';

@Component({
  selector: 'app-teacher-delete-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: '',
  styles: ``,
})
export class TeacherDeleteModalComponent implements OnDestroy {
  @Input() teacher?: TeacherResponse;

  faExclamationTriangle = faExclamationTriangle;
  faCheckCircle = faCheckCircle;
  faTimes = faTimes;
  faTrash = faTrash;
  faToggleOn = faToggleOn;

  loading = false;

  private notyf = new Notyf({
    duration: 4000,
    position: { x: 'right', y: 'top' },
  });

  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private teachersService: TeachersService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  confirmAction(): void {
    if (!this.teacher) return;

    this.loading = true;

    if (this.teacher.status) {
      // Desactivar
      this.teachersService
        .delete(this.teacher.teacherId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.activeModal.close('success');
          },
          error: (error) => {
            this.loading = false;
            this.notyf.error(error.error?.message || 'Error al desactivar profesor');
          },
        });
    } else {
      // Activar
      this.teachersService
        .activate(this.teacher.teacherId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.activeModal.close('success');
          },
          error: (error) => {
            this.loading = false;
            this.notyf.error(error.error?.message || 'Error al activar profesor');
          },
        });
    }
  }

  getInitials(fullName: string): string {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getAvatarColor(fullName: string): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
    const index = fullName.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
