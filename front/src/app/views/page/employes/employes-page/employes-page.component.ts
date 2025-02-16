import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-employes-page',
  standalone: true,
  imports: [],
  templateUrl: './employes-page.component.html',
  styleUrl: './employes-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployesPageComponent {
  public title = 'Персонал';

}
