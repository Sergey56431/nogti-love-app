import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { InputMask } from 'primeng/inputmask';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CalendarService, CategoriesService, ClientsService, DirectsService } from '@shared/services';
import { AuthService } from '@core/auth';
import {
  CalendarResponse,
  CategoriesType, ClientInfoType,
  DefaultResponseType,
  DirectsClientType,
  DirectsType,
  ServicesType,
  UserInfoType,
} from '@shared/types';
import { MultiSelect } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';
import { ProgressStatuses, SnackStatusesUtil } from '@shared/utils';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-direct-visit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FloatLabel,
    InputText,
    InputMask,
    Select,
    Textarea,
    ButtonModule,
    MultiSelect,
  ],
  templateUrl: './direct-visit.component.html',
  styleUrl: './direct-visit.component.scss',
})
export class DirectVisitComponent implements OnInit {

  protected _date: CalendarResponse | null = null;
  protected _clients = signal<ClientInfoType[]>([]);
  protected _categories = signal<CategoriesType[]>([]);
  protected _timeSlots = signal<string[]>([]);
  protected _choiceFavor = signal<string[]>([]);
  protected _choiceClient = signal<ClientInfoType | undefined>(undefined);
  protected _timeSlotChoice = signal<{ time: string } | null>(null);
  protected _favors = signal<ServicesType[]>([]);
  private _userInfo = signal<UserInfoType | undefined>(undefined);

  constructor(private readonly _fb: FormBuilder,
              private readonly _toast: MessageService,
              private readonly _directsService: DirectsService,
              private readonly _categoryService: CategoriesService,
              private readonly _calendarService: CalendarService,
              private readonly _authService: AuthService,
              private readonly _clientsService: ClientsService,
              private readonly _dialogConfig: DynamicDialogConfig,
              private readonly _ref: DynamicDialogRef) {
  }

  protected _newVisitor = this._fb.group({
    name: new FormControl('', [Validators.required]),
    phone: new FormControl(undefined),
    favor: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required]),
    comment: new FormControl(''),
  });

  // Инициализация
  public ngOnInit() {
    try {
      this._date = this._dialogConfig.data;
      this._userInfo.set(this._authService.getUserInfo());
      this._calendarService.fetchDayById(this._date?.id ?? '').subscribe(date => {
        this._timeSlots.set(orderBy((date as CalendarResponse).freeSlots ?? [], c => c, 'asc'));
      });
      this._clientsService.fetchAdminClients(this._userInfo()?.userId ?? '').subscribe(clients => {
        this._clients.set(clients as ClientInfoType[]);
        console.error(clients);
      });

      this._categoryService.getCategoryByUser(this._userInfo()?.userId ?? '').subscribe(categories => {
        if ((categories as DefaultResponseType).error === undefined) {
          this._categories.set(categories as CategoriesType[]);
          this._categories().forEach(category => {
            this._favors().push(...category?.services ?? []);
          });
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Создание новой записи с последующей отправкой
  protected _createDirect() {
    const favorsId = this._choiceFavor()?.map(favors => {
      return { serviceId: favors ?? '' };
    });
    const data: DirectsType = {
      id: this._choiceClient()?.userId ?? '',
      userId: this._userInfo()?.userId ?? '',
      clientName: this._choiceClient()?.name ?? '',
      date: this._date?.date.split('.').reverse().join('-') ?? '',
      comment: this._newVisitor.controls.comment.value ?? '',
      phone: this._choiceClient()?.phoneNumber ?? '',
      time: this._timeSlotChoice()?.time ?? '',
      services: favorsId,
    };
    this._sendNewDirect(data);
  }

  // Отправка новой записи на бэкенд
  private _sendNewDirect(data: DirectsType) {
    this._directsService.createDirect(data).subscribe({
      next: direct => {
        const message = `Пользователь ${(direct as DirectsClientType).clientName} успешно записан!`;
        const _snack = SnackStatusesUtil.getStatuses(ProgressStatuses.SUCCESS, message);
        this._toast.add(_snack!);
        this._ref?.close();
      },
      error: err => {
        const message = `Пользователь ${data.clientName} не записан!`;
        const _snack = SnackStatusesUtil.getStatuses(ProgressStatuses.ERROR, message);
        this._toast.add(_snack!);
        console.error(err);
      },
    });
  }

  // Закрытие диалогового окна
  protected _closeDialog() {
    this._ref?.close();
  }
}
