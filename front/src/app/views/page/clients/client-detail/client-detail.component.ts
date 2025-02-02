import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [Breadcrumb, RouterLink, NgOptimizedImage],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent implements OnInit {
  protected title = 'Клиенты';
  protected _home = { label: 'Клиенты', routerLink: ['/clients'], icon: '' };
  protected breadcrumb = [{ label: 'Клиент (Здесь вставить имя)' }];

  constructor(private readonly _activatedRoute: ActivatedRoute) {}

  public ngOnInit() {
    // Запрос пользователя
  }
}
