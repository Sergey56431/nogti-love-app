import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DefaultResponseType, ServicesType, CategoriesType, UserInfoType, Services } from '@shared/types';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FavorsService, CategoriesService } from '@shared/services';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { InputMask } from 'primeng/inputmask';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { catchError, from } from 'rxjs';
import { SnackStatusesUtil } from '@shared/utils';
import { MessageService } from 'primeng/api';
import { NgTemplateOutlet } from '@angular/common';
import { SelectButton } from 'primeng/selectbutton';
import { AuthService } from '@core/auth';

enum DialogVariants {
  SERVICE = 'service',
  CATEGORY = 'category',
}

@Component({
  selector: 'app-favors-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, Button, Tooltip, Select, FloatLabel, InputMask, InputNumber, InputText, NgTemplateOutlet, SelectButton, FormsModule],
  templateUrl: './favors-dialog.component.html',
  styleUrl: './favors-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FavorsDialogComponent implements OnInit {
  public formsCount = signal<number>(0);
  protected readonly _dialogVariants = DialogVariants;
  protected _choiceDialogVariant = signal<string>(DialogVariants.SERVICE);

  protected _choiceCategory = signal<string>('');
  protected _dialogVariant = '';

  protected _categoriesList = signal<CategoriesType[]>([]);
  protected _favorEdit = signal<Services | undefined>(undefined);
  protected _categoryEdit = signal<CategoriesType | undefined>(undefined);

  private _userInfo = signal<UserInfoType | undefined>(undefined);

  protected _isEdit = signal<boolean>(false);

  private readonly _ref = inject(DynamicDialogRef);
  private readonly _dataFavor = inject(DynamicDialogConfig);
  private readonly _favorService = inject(FavorsService);
  private readonly _authService = inject(AuthService);
  private readonly _categoryService = inject(CategoriesService);
  private readonly _snackBar = inject(MessageService);
  private readonly _fb = inject(FormBuilder);

  protected _dialogOptions = [
    { label: 'Услуга', value: DialogVariants.SERVICE },
    { label: 'Категория', value: DialogVariants.CATEGORY },
  ];

  // Форма для создания услуг
  protected _favorsListForm: FormGroup = this._fb.group({
    category: ['', Validators.required],
    favors: this._fb.array([
      this._fb.group({
        name: ['', Validators.required],
        price: [0, Validators.required],
        time: ['', Validators.required],
      }),
    ]),
  });

  // Форма для создания категорий
  protected _categoriesListForm = this._fb.group({
    categories: this._fb.array([
      this._fb.group({
        name: ['', Validators.required],
      }),
    ]),
  });

  // Гетер для получения списка услуг
  protected get _favors(): FormArray {
    return this._favorsListForm.get('favors') as FormArray;
  }

  // Гетер для получения списка категорий
  protected get _categories(): FormArray {
    return this._categoriesListForm.get('categories') as FormArray;
  }

  public ngOnInit(): void {
    this._userInfo.set(this._authService.getUserInfo());
    this._dialogVariant = DialogVariants.SERVICE;
    this._categoryService
      .getCategoryByUser(this._userInfo()?.userId ?? '')
      .pipe(
        catchError((error: ErrorHandler) => {
          console.error(error);
          return [];
        }),
      )
      .subscribe((categories) => {
        if ((categories as DefaultResponseType).error === undefined) {
          this._categoriesList.set(categories as CategoriesType[]);
        }
      });
    if (this._dataFavor.data !== undefined) {
      this._isEdit.set(true);
      if (this._dataFavor.data.edit === 'favors') {
        this._choosingVariantDialog(DialogVariants.SERVICE);
        this._editingFavorInit();
      } else {
        this._choosingVariantDialog(DialogVariants.CATEGORY);
        this._editingCategoryInit();
      }
    } else {
      this._isEdit.set(false);
    }
  }

  // Функция для выбора варианта диалогового окна (либо создание категорий либо создание услуг)
  protected _choosingVariantDialog(value: string): void {
    this._choiceDialogVariant.set(value);
    this._dialogVariant = value;
  }

  // Функция для выбора категории (нужна для выбора при инициализации)
  protected _choosingCategory(value: string) {
    this._choiceCategory.set(value);
  }

  // Функция для инициализации редактирования услуги
  private _editingFavorInit() {
    this._favors.clear();
    const favor: Services = this._dataFavor.data;
    this._favorEdit.set(favor);
    this._dialogVariant = DialogVariants.SERVICE;
    this._choosingCategory(this._favorEdit()?.categoryId ?? '');
    try {
      if (favor) {
        this._categoryService.getCategoryById(favor.categoryId).subscribe(category => {
          this._favorsListForm.get('category')?.setValue((category as CategoriesType).id);
          const favorGroup = this._fb.group({
            name: [(favor as Services).name ?? '', Validators.required],
            price: [(favor as Services).price ?? 0, Validators.required],
            time: [(favor as Services).time ?? '', Validators.required],
          });
          this._favors.push(favorGroup);
        });
      } else {
        console.error('Полученные данные не содержат favor');
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  }

  // Функция для инициализации редактирования категорий
  private _editingCategoryInit(): void {
    this._categories.clear();
    this._dialogVariant = DialogVariants.CATEGORY;
    this._categoryEdit.set(this._dataFavor.data);
    try {
      // this._categoryService.getCategoryById(this._categoryEdit()?.id ?? '').subscribe(category => {
      if (this._categoryEdit()) {
        const favorGroup = this._fb.group({
          name: [this._categoryEdit()?.name ?? '', Validators.required],
        });

        // Добавляем новую группу в FormArray
        this._categories.push(favorGroup);
      } else {
        console.error('Полученные данные не содержат favor');
      }
      // });
    } catch (err) {
      console.error(err);
    }
  }

  // Функция для генерации новых полей для формы услуг
  protected _createNewFieldsFavors(): void {
    this._favors.push(
      this._fb.group({
        name: ['', Validators.required],
        price: [0, Validators.required],
        time: ['', Validators.required],
      }),
    );
  }

  // Функция для генерации новых полей для формы категорий
  protected _createNewFieldsCategories(): void {
    this._categories.push(
      this._fb.group({
        name: ['', Validators.required],
      }),
    );
  }

  // Функция для потоковой отправки списка новых услуг
  protected _sendNewFavorsList(): void {
    const favors = this._favors?.value;
    favors?.forEach((favor: ServicesType) => {
      Object.assign(favor, { categoryId: this._choiceCategory() });
    });

    from(favors).subscribe({
      next: (favor) => {
        this._favorService.createFavors(favor as ServicesType).subscribe({});
      },
      error: (err) => {
        this._showMessage('error', 'Ошибка при добавлении услуги');
        console.error(err);
      },
      complete: () => {
        this._showMessage('success', 'Услуга добавлена');
        this._close();
      },
    });
  }

  // Функция для потоковой отправки списка новых категорий
  protected _sendNewCategoriesList(): void {
    const categories = this._categories?.value;
    categories.forEach((category: CategoriesType) => {
      Object.assign(category, { userId: this._userInfo()?.userId });
    });

    from(categories).subscribe({
      next: (category) => {
        this._categoryService.createCategory(category as CategoriesType).subscribe({});
      },
      error: (err) => {
        this._showMessage('error', 'Ошибка при добавлении услуги');
        console.error(err);
      },
      complete: () => {
        this._showMessage('success', 'Категория добавлена');
        this._close();
      },
    });
  }

  // Функция для обновления выбранной услуги
  protected _updateFavor(): void {
    const favorEdit = this._favors?.value[0];
    Object.assign(favorEdit, { categoryId: this._choiceCategory() });

    this._favorService.updateFavors(favorEdit, this._favorEdit()?.id ?? '').subscribe({
      error: err => {
        this._showMessage('error', 'Ошибка при обновлении услуги' + err);
        console.error(err);
      },
      complete: () => {
        this._showMessage('success', 'Услуга обновлена');
        this._close();
      },
    });
  }

  // Функция для обновления выбранной категории
  protected _updateCategory(): void {
    const categoryEdit = this._categories?.value[0];
    Object.assign(categoryEdit, { userId: this._userInfo()?.userId });

    this._categoryService.updateCategory(categoryEdit, this._categoryEdit()?.id ?? '').subscribe({
      error: err => {
        this._showMessage('error', 'Ошибка при обновлении категории' + err);
        console.error(err);
      },
      complete: () => {
        this._showMessage('success', 'Категория обновлена');
        this._close();
      },
    });
  }

  // Функция для вывода информационного сообщения с результатом операции
  private _showMessage(status: string, msg: string): void {
    const message = SnackStatusesUtil.getStatuses(status, msg);
    if (message) {
      this._snackBar.add(message);
    }
  }

  protected _close() {
    this.formsCount.set(0);
    this._ref.close();
  }
}
