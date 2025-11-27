import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faUser,
  faGraduationCap,
  faCertificate,
  faCalendar,
  faBuilding,
  faBriefcase,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';

import { TeachersService } from '../../services/teachers.service';
import { TeacherResponse } from '../../models/teachers.models';

@Component({
  selector: 'app-teacher-detail-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: ``,
  styles: ``
})
export class TeacherDetailModalComponent implements OnInit, OnDestroy {
  @Input() teacherId!: number;

  faTimes = faTimes;
  faUser = faUser;
  faGraduationCap = faGraduationCap;
  faCertificate = faCertificate;
  faCalendar = faCalendar;
  faBuilding = faBuilding;
  faBriefcase = faBriefcase;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  teacher?: TeacherResponse;
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private teachersService: TeachersService
  ) {}

  ngOnInit(): void {
    this.loadTeacher();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTeacher(): void {
    this.loading = true;
    this.teachersService
      .getById(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teacher) => {
          this.teacher = teacher;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.activeModal.dismiss('error');
        },
      });
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

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
