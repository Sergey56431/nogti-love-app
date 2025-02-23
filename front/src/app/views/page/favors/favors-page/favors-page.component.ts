import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FavorsService } from '@shared/services';
import { DialogService } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DefaultResponseType, ServicesType } from '@shared/types';
import { MessageService } from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';
import { Tooltip } from 'primeng/tooltip';
import { FavorsDialogComponent } from '@shared/components';

@Component({
  selector: 'app-favors-page',
  standalone: true,
  imports: [Button, TableModule, Tooltip],
  templateUrl: './favors-page.component.html',
  styleUrl: './favors-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavorsPageComponent implements OnInit {
  protected _title = 'Услуги';

  protected _favorsList = signal<ServicesType[]>([]);

  private readonly _favorsService = inject(FavorsService);
  private readonly _dialogService = inject(DialogService);
  private readonly _snackService = inject(MessageService);

  public ngOnInit(): void {
    this._favorsService.getAllFavors().subscribe((result) => {
      if ((result as DefaultResponseType).error === undefined) {
        this._favorsList.set(result as ServicesType[]);
      } else {
        const error = SnackStatusesUtil.getStatuses(
          'error',
          (result as DefaultResponseType).message,
        )!;
        this._snackService.add(error);
      }
    });
  }

  protected _addFavors() {
    this._dialogService.open(FavorsDialogComponent, {
      header: 'Добавить услуги / категории',
      draggable: true,
      closable: true,
      closeOnEscape: true,
      modal: true,
      width: '450px',
      contentStyle: {
        overflow: 'none',
        maxWidth: '450px',
        maxHeight: '600px',
      },
    });
  }

  protected _editFavors(favor: ServicesType): void {
    this._dialogService.open(FavorsDialogComponent, {
      header: 'Редактировать услуги / категории',
      draggable: true,
      closable: true,
      closeOnEscape: true,
      modal: true,
      width: '450px',
      contentStyle: {
        overflow: 'none',
        maxWidth: '450px',
        maxHeight: '600px',
      },
      data: favor,
    });
  }
}
