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

@Component({
  selector: 'app-schedule-main',
  standalone: true,
  imports: [Button, Menu, DatePickerComponent, Tooltip],
  templateUrl: './schedule-main.component.html',
  styleUrl: './schedule-main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleMainComponent {
  @ViewChild(DatePickerComponent) calendar?: DatePickerComponent;

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
    return this.calendar?.directs() ?? [];
  });

  constructor(
    private _dialogOpen: DialogService,
    private readonly _directsService: DirectsService
  ) {}

  protected _refreshDatePicker() {
    this.calendar?._refreshDatePicker();
  }

  protected _newDirect() {

    this._dialogOpen.open(DirectVisitComponent, {
      header: 'Добавить новую запись',
      width: '500px',
      modal: true,
      draggable: true,
      contentStyle: {
        overflow: 'visible',
      },
      closable: true,
      data: this.calendar?.selectedDate(),
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
      draggable: true,
      contentStyle: {},
      closable: true,
      data: direct,
    });
  }
}
