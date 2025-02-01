import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input, OnInit, ViewChild,
} from '@angular/core';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { DatePickerComponent, DirectVisitComponent } from '@shared/components';
import { createDispatchMap, select, Store } from '@ngxs/store';
import { DirectsState } from '@core/store/directs/store';
import { Directs } from '@core/store/directs/actions';
import { UsersActions } from '@core/store';
import { DirectsClientType } from '@shared/types/directs-client.type';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalendarService } from '@shared/services';

@Component({
  selector: 'app-schedule-main',
  standalone: true,
  imports: [Button, Menu, DatePickerComponent],
  templateUrl: './schedule-main.component.html',
  styleUrl: './schedule-main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleMainComponent implements OnInit {
  @ViewChild(DatePickerComponent) calendar?: DatePickerComponent;

  private _ref: DynamicDialogRef | undefined;

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
  protected _clientsList: DirectsClientType[] = [];
  protected directs = 5; // по мере расширения проекта переделать эту переменную
  private _directs = this._store.selectSignal(DirectsState.getDirects);

  private _actions = createDispatchMap({
    loadDirects: Directs.GetDirects,
    loadUser: UsersActions.GetUser,
  });

  constructor( private _dialogOpen: DialogService,
               private _store: Store,
               private readonly _calendarService: CalendarService) {
  }

  public ngOnInit():void {

  }

  protected _refreshDatePicker() {
    this.calendar?._refreshDatePicker();
  }

  protected _newDirect() {
    this._ref = this._dialogOpen.open(DirectVisitComponent, {
      header: 'Добавить новую запись',
      width: '500px',
      modal: true,
      draggable: true,
      contentStyle: {
        overflow: 'visible',
      },
      closable: true,
    });
  }

  private _getDirects() {

  }
}
