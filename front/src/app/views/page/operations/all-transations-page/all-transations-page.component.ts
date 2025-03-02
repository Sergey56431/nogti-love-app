import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-all-transations-page',
  standalone: true,
  imports: [NgStyle, RouterLink],
  templateUrl: './all-transations-page.component.html',
  styleUrl: './all-transations-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllTransationsPageComponent {
  protected _title = 'Все операции';

  protected _categories = [
    {
      img: 'category',
      route: '/category',
      name: 'Категории',
    },
    {
      img: 'operation-list',
      route: '/operations-list',
      name: 'Список операций',
    },
    {
      img: 'create-operation',
      route: '/create-operation',
      name: 'Создание операций',
    },
    {
      img: 'analitics',
      route: '/analytics',
      name: 'Аналитика',
    },
  ];
}
