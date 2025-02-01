import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [Breadcrumb, RouterLink],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent {
  protected title = 'Клиенты';
  protected _home = { label: 'Клиенты', routerLink: ['/clients'], icon: '' };
  protected breadcrumb = [{ label: 'Клиент (Здесь вставить имя)'}];
}
