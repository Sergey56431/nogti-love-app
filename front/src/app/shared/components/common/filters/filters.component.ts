import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Checkbox } from 'primeng/checkbox';
import { Slider } from 'primeng/slider';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    Checkbox,
    Slider,
    FormsModule,
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent {
  protected _service = input('');
  protected _rangeTime = [15, 75];

  protected _services = [
    { id: 1, name: 'Маникюр' },
    { id: 2, name: 'Педикюр' },
  ];

  protected _masters = [
    { id: 3, name: 'Валерия' },
    { id: 4, name: 'Юлия' },
    { id: 5, name: 'Лилия' },
  ];

  protected _choiceServices(value: string) {
    console.error(value);
  }
}
