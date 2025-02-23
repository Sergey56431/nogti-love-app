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
import { DirectsType } from '@shared/types/directs.type';
import { DirectsService, FavorsService } from '@shared/services';
import { CategoriesService } from '@shared/services/categories';
import { CategoriesType } from '@shared/types/categories.type';
import { AuthService } from '@core/auth';
import { ServicesType } from '@shared/types/services.type';
import { DefaultResponseType } from '@shared/types';
import { MultiSelect } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';
import { ProgressStatuses, SnackStatusesUtil } from '@shared/utils';

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

  private _date = '';
  private _time = '';
  protected _categories =  signal<CategoriesType[]>([]);
  protected _choiceFavor = signal<ServicesType[] | undefined>(undefined);
  protected _favors = signal<ServicesType[]>([]);

  // Нужен запрос с временем записей

  protected _timeVariant = [
    {
      name: '11:00',
      code: 1,
    },
    {
      name: '13:00',
      code: 2,
    },
    {
      name: '15:00',
      code: 3,
    },
    {
      name: '17:00',
      code: 4,
    },
  ];

  constructor(private readonly _fb: FormBuilder,
              private readonly _toast: MessageService,
              private readonly _directsService: DirectsService,
              private readonly _categoryService: CategoriesService,
              private readonly _authService: AuthService,
              private readonly _favorService: FavorsService,
              private readonly _dialogConfig: DynamicDialogConfig,
              private readonly _ref: DynamicDialogRef) {}

  protected _newVisitor = this._fb.group({
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(
        '^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$',
      ),
    ]),
    category: new FormControl('', [Validators.required]),
    favor: new FormControl('', [Validators.required]),
    dateVisit: new FormControl('', [Validators.required]),
    comment: new FormControl(''),
  });

  // Инициализация
  public ngOnInit() {
    this._date = this._dialogConfig.data;
    const user = this._authService.getUserInfo();
    try {
      this._categoryService.getCategoryByUser(user.userId ?? '').subscribe(categories => {
        this._categories.set(categories);
      });
    } catch (err) {
      console.log(err);
    }
  }

  // Функция форматирования объекта времени в строку для отправки на сервер
  protected _choiceTime(time:{name: string, code: number}) {
    this._time = time.name;
  }

  // Получение всех услуг
  protected _fetchFavors(category: CategoriesType) {
    this._favorService.getFavorsByCategory(category.id).subscribe((favors)  => {
      if ((favors as DefaultResponseType).error == null) {
        this._favors.set(favors as ServicesType[]);
      }
    });
  }

  // Создание новой записи с последующей отправкой
  protected _createDirect() {
    const favorsId = this._favors().map(favors => {
      return {serviceId: favors.id ?? ''};
    });
    const data: DirectsType = {
      clientName: this._newVisitor.controls.name.value ?? '',
      date: this._date ?? '',
      comment: this._newVisitor.controls.comment.value ?? '',
      phone: this._newVisitor.controls.phone.value ?? '',
      time: this._time ?? '',
      services: favorsId,
    };
    this._sendNewDirect(data);
  }

  // Отправка новой записи на бэкенд
  private _sendNewDirect(data: DirectsType) {
    this._directsService.createDirect(data).subscribe({
      next: direct => {
        const message = `Пользователь ${direct.clientName} успешно записан!`;
        const _snack = SnackStatusesUtil.getStatuses(ProgressStatuses.SUCCESS, message);
        this._toast.add(_snack!);
        this._ref?.close();
      },
      error: err => {
        const message = `Пользователь ${data.clientName} не записан!`;
        const _snack = SnackStatusesUtil.getStatuses(ProgressStatuses.ERROR, message);
        this._toast.add(_snack!);
        console.log(err);
      }
    });
  }

  // Закрытие диалогового окна
  protected _closeDialog() {
    this._ref?.close();
  }
}
