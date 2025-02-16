import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-all-transations-page',
  standalone: true,
  imports: [],
  templateUrl: './all-transations-page.component.html',
  styleUrl: './all-transations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllTransationsPageComponent {
  public title = 'Все операции';
}
