import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-students-list',
  imports: [],
  templateUrl: './students-list.component.html',
  styleUrl: './students-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentsListComponent {

}
