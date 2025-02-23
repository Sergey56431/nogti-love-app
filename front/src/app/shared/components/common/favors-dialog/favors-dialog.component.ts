import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ServicesType } from '@shared/types';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FavorsService } from '@shared/services';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-favors-dialog',
  standalone: true,
  imports: [],
  templateUrl: './favors-dialog.component.html',
  styleUrl: './favors-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

/* TODO
* - Создать динамическую форму для формирования массива услуг/категорий который потоком будет перебираться и отправляться на сервер
* - Запретить создавать услуги если нет хотя бы одной категории
* - В случае редактирования отправлять одиночные запросы
*/

export class FavorsDialogComponent implements OnInit {
  private _favorInfo = signal<ServicesType | undefined>(undefined);

  private readonly _dataFavor = inject(DynamicDialogConfig);
  private readonly _favorService = inject(FavorsService);
  private readonly _fb = inject(FormBuilder);

  public ngOnInit(): void {
    if (this._dataFavor.data) {
      this._favorInfo.set(this._dataFavor.data);
      try {
        this._favorService.getFavorsById(this._favorInfo()?.id ?? '')
          .subscribe((favor) => {
            console.log(favor);
          });
      } catch (error) {
        console.log(error);
      }
    }
  }
}
