import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CategoriesService, FavorsService } from '@shared/services';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CategoriesType, DefaultResponseType, Services, ServicesType, UserInfoType } from '@shared/types';
import { MessageService } from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';
import { Tooltip } from 'primeng/tooltip';
import { FavorsDialogComponent } from '@shared/components';
import { AuthService } from '@core/auth';

@Component({
  selector: 'app-favors-page',
  standalone: true,
  imports: [Button, TableModule, Tooltip],
  templateUrl: './favors-page.component.html',
  styleUrl: './favors-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavorsPageComponent implements OnInit {
  public _isOverflow = signal<boolean>(false);

  private _userInfo: UserInfoType = {} as UserInfoType;
  protected _title = 'Услуги и категории';

  private _ref: DynamicDialogRef | undefined;

  protected _favorsList = signal<ServicesType[]>([]);
  protected _categoriesList = signal<CategoriesType[]>([]);

  private readonly _favorsService = inject(FavorsService);
  private readonly _categoryService = inject(CategoriesService);
  private readonly _dialogService = inject(DialogService);
  private readonly _snackService = inject(MessageService);
  private readonly _authService = inject(AuthService);


  public ngOnInit(): void {
    this._userInfo = this._authService.getUserInfo();
    try {
      this._getAllCategories();
    } catch (err) {
      const status = SnackStatusesUtil.getStatuses('error', 'Ошибка получения данных');
      this._snackService.add(status);
      console.error(err);
    }

  }

  // Запрос на получение всех услуг
  private _getAllFavors(): void {
    this._favorsService.getAllFavors().subscribe((result) => {
      if ((result as DefaultResponseType).error === undefined) {
        this._favorsList.set(result as ServicesType[]);
      } else {
        const error = SnackStatusesUtil.getStatuses('error', (result as DefaultResponseType).message)!;
        this._snackService.add(error);
      }
    });
  }

  // Запрос на получение всех категорий и услуг
  private _getAllCategories(): void {
    const userId = this._userInfo.userId ?? ''; // Кэшируем userId для повторного использования

    this._categoryService.getCategoryByUser(userId).subscribe((result) => {
      const response = result as DefaultResponseType;
      // Проверяем наличие ошибки в ответе
      if (response.error === undefined) {
        // Устанавливаем категории и очищаем список услуг
        this._categoriesList.set(result as CategoriesType[]);
        this._favorsList.set([]);

        // Извлекаем услуги из категорий и добавляем их в список
        const favorsToAdd = (result as CategoriesType[])
          .flatMap(item => item.services || []) // Используем flatMap для извлечения всех услуг
          .filter(favor => favor); // Фильтруем только существующие услуги

        // Добавляем все услуги за один раз
        this._favorsList().push(...favorsToAdd);
      } else {
        // Обрабатываем ошибку
        const error = SnackStatusesUtil.getStatuses('error');
        this._snackService.add(error!);
      }
    });
  }


  // Вызов модального окна для добавления услуг/категорий
  protected _addPosition() {
    this._ref = this._dialogService.open(FavorsDialogComponent, {
      header: 'Добавить услуги / категории',
      draggable: false,
      closable: true,
      closeOnEscape: true,
      modal: true,
      width: '450px',
      contentStyle: {
        overflow: 'auto',
        maxWidth: '450px',
        minHeight: '384px',
        maxHeight: '600px',
      },
    });
    this._ref.onClose.subscribe(() => {
      this._getAllCategories();
    });
  }

  // Вызов модального окна для добавления категорий
  protected _editPosition(favor: Services, edit: string): void {
    this._ref = this._dialogService.open(FavorsDialogComponent, {
      header: 'Редактировать услуги / категории',
      draggable: false,
      closable: true,
      closeOnEscape: true,
      modal: true,
      width: '450px',
      contentStyle: {
        overflow: 'visible',
        maxWidth: '450px',
        maxHeight: '600px',
      },
      data: Object.assign(favor, { edit: edit }),
    });

    this._ref.onClose.subscribe(() => {
      this._getAllCategories();
    });
  }

  // Удаление выбранной услуги
  protected _removeFavor(favor: Services): void {
    this._favorsService.deleteFavors(favor.id ?? '').subscribe(result => {
      if ((result as DefaultResponseType).error === undefined) {
        this._getAllCategories();
        this._showMessage('success', `Услуга "${favor.name}" успешно удалена`);
      } else {
        this._showMessage('error', `Ошибка удаления услуги "${favor.name}"`);
      }
    });
  }

  // Удаление выбранной категории
  protected _removeCategory(category: CategoriesType): void {
    this._categoryService.deleteCategory(category.id ?? '').subscribe(result => {
      if ((result as DefaultResponseType).error === undefined) {
        this._categoriesList.update((prev) =>
          prev.filter((item) => item.id !== category.id),
        );

        this._showMessage('success', `Категория "${category}.name}" успешно удалена`);
      } else {
        this._showMessage('error', `Ошибка удаления услуги "${category}.name}"`);
      }
    });
  }

  // Вывод информационного сообщения с результатом операции
  private _showMessage(status: string, msg: string): void {
    const toast = SnackStatusesUtil.getStatuses(status, msg)!;
    this._snackService.add(toast);
  }
}
