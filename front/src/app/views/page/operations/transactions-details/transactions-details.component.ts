import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-transactions-details',
  standalone: true,
  imports: [],
  templateUrl: './transactions-details.component.html',
  styleUrl: './transactions-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsDetailsComponent {

}
