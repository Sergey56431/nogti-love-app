import { ChangeDetectionStrategy, Component, computed, Signal, ViewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import {
  ClientCardComponent,
  DatePickerComponent,
  DirectVisitComponent,
} from '@shared/components';
import { DirectsClientType } from '@shared/types/directs-client.type';
import { DialogService } from 'primeng/dynamicdialog';
import { DirectsService } from '@shared/services';
import { Tooltip } from 'primeng/tooltip';
import { DirectsType } from '@shared/types/directs.type';
import { orderBy } from 'lodash';
import { ConfirmationService, MessageService, ToastMessageOptions } from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-schedule-main',
  standalone: true,
  imports: [Button, Menu, DatePickerComponent, Tooltip, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './schedule-main.component.html',
  styleUrl: './schedule-main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleMainComponent {
  @ViewChild(DatePickerComponent) calendar?: DatePickerComponent;

  private _status: ToastMessageOptions = {} as ToastMessageOptions;
  protected _options = [
    { routerLink: '', label: 'Редактировать расписание' },
    { routerLink: '', label: 'Список всех записей' },
    {
      label: 'Обновить расписание',
      command: () => {
        this._refreshDatePicker();
      },
    },
  ];

  protected _directsList: Signal<DirectsType[]> = computed(() => {
    return orderBy(this.calendar?.directs(), x => x.time, ['asc']) ?? [];
  });

  constructor(private readonly _dialogOpen: DialogService,
              private readonly _directsService: DirectsService,
              private readonly _snackBar: MessageService,
              private readonly _confirmationService: ConfirmationService) {
  }

  protected _refreshDatePicker() {
    this.calendar?._refreshDatePicker();
  }

  protected _newDirect() {

    this._dialogOpen.open(DirectVisitComponent, {
      header: 'Добавить новую запись',
      width: '500px',
      modal: true,
      draggable: false,
      contentStyle: {
        overflow: 'visible',
      },
      closable: true,
      data: this.calendar?.selectedDate(),
    });
  }

  protected _deleteDirect(direct: DirectsClientType) {
    this._confirmationService.confirm({
      message: `Вы уверены, что хотите удалить запись "${direct?.clientName}" на "${direct?.time}"?`,
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      closeOnEscape: true,
      rejectButtonProps: {
        label: 'Отмена',
        severity: 'secondary',
        outlined: true,
        icon: 'pi pi-times',
      },
      acceptButtonProps: {
        severity: 'danger',
        outlined: false,
        icon: 'pi pi-trash',
        label: 'Удалить',
      },
      accept: () => {
        if (direct.id != null) {
          this._directsService.deleteDirect(direct.id).subscribe({
            next: () => {
              this._status = SnackStatusesUtil.getStatuses('Успешно', 'Запись удалена');
              this._snackBar.add(this._status);
            },
            error: err => {
              this._status = SnackStatusesUtil.getStatuses('Ошибка', err);
              this._snackBar.add(this._status);
              console.log(err);
            },
            complete: () => {
              this.calendar?.fetchDirectsToDay(this.calendar?.selectedDate());
            },
          });
        }
      },
      reject: () => {
        //empty
      },
    });
  }

  protected _moreInfo(direct: DirectsClientType) {
    this._dialogOpen.open(ClientCardComponent, {
      closeOnEscape: true,
      style: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        border: 'none',
      },
      modal: true,
      draggable: false,
      contentStyle: {},
      closable: true,
      data: direct,
    });
  }
}
