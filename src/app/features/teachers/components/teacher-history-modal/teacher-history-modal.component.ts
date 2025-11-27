import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faHistory, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { TeachersService } from '../../services/teachers.service';
import { TeacherAuditHistory } from '../../models/teachers.models';

@Component({
  selector: 'app-teacher-history-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: ``,
  styles: ``
})
export class TeacherHistoryModalComponent implements OnInit, OnDestroy {
  @Input() teacherId!: number;
  @Input() teacherName!: string;

  faTimes = faTimes;
  faHistory = faHistory;
  faUser = faUser;
  faCalendar = faCalendar;

  history: TeacherAuditHistory[] = [];
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private teachersService: TeachersService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHistory(): void {
    this.loading = true;
    this.teachersService
      .getAuditHistory(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.history = history;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  getActionClass(action: string): string {
    const actionMap: any = {
      INSERT: 'insert',
      UPDATE: 'update',
      DELETE: 'delete',
    };
    return actionMap[action] || '';
  }

  getActionIcon(action: string): any {
    // Retornar iconos según la acción
    return faHistory;
  }

  getActionLabel(action: string): string {
    const labels: any = {
      INSERT: 'Creación',
      UPDATE: 'Actualización',
      DELETE: 'Eliminación',
    };
    return labels[action] || action;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('es-PE');
  }
}
