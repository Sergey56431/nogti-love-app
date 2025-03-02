import { ChangeDetectionStrategy, Component, ErrorHandler, inject, OnInit, signal } from '@angular/core';
import { DefaultResponseType, ServicesType, CategoriesType } from '@shared/types';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
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

/* TODO
 * - В случае редактирования отправлять одиночные запросы
 * - Переключение на создание категорий/услуг
 * - Редактирование выбранной услуги/категории
 * - Удаление выбранной услуги/категории
 */
export class FavorsDialogComponent implements OnInit {
  protected readonly _dialogVariants = DialogVariants;
  protected _choiceDialogVariant = signal<string>(DialogVariants.SERVICE);

  protected _choiceCategory = '';
  protected _categoriesList = signal<CategoriesType[]>([]);
  protected _favorEdit = signal<ServicesType | undefined>(undefined);
  protected _categoryEdit = signal<CategoriesType | undefined>(undefined);

  protected _isEdit = signal<boolean>(false);

  private readonly _dataFavor = inject(DynamicDialogConfig);
  private readonly _favorService = inject(FavorsService);
  private readonly _categoryService = inject(CategoriesService);
  private readonly _snackBar = inject(MessageService);
  private readonly _fb = inject(FormBuilder);

  protected _dialogOptions = [
    { label: 'Услуга', value: DialogVariants.SERVICE },
    { label: 'Категория', value: DialogVariants.CATEGORY },
  ];

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

  protected _categoriesListForm = this._fb.group({
    categories: this._fb.array([
      this._fb.group({
        name: ['', Validators.required],
      }),
    ]),
  });

  protected get _category() {
    return this._favorsListForm.get('category');
  }

  protected get _favors(): FormArray {
    return this._favorsListForm.get('favors') as FormArray;
  }

  protected get _categories(): FormArray {
    return this._categoriesListForm.get('categories') as FormArray;
  }

  public ngOnInit(): void {
    this._categoryService
      .getAllCategories()
      .pipe(
        catchError((error: ErrorHandler) => {
          console.log(error);
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
        this._editingFavorInit();
      } else {
        this._editingCategoryInit();
      }
    } else {
      this._isEdit.set(false);
    }
  }

  protected _choosingCategory(value: string) {
    this._choiceCategory = value;
  }

  // Функция для инициализации редактирования услуги
  private _editingFavorInit() {
    this._favors.clear();
    this._choiceDialogVariant.set(DialogVariants.SERVICE);
    this._favorEdit.set(this._dataFavor.data);
    this._choosingCategory(this._favorEdit()?.categoryId ?? '');
    try {
      this._favorService.getFavorsById(this._favorEdit()?.id ?? '').subscribe((favor) => {
        // Убедитесь, что favor имеет правильный тип
        if (favor) {
          this._category?.setValue(this._favorEdit()?.categoryId);
          const favorGroup = this._fb.group({
            name: [(favor as ServicesType).name ?? '', Validators.required],
            price: [(favor as ServicesType).price ?? 0, Validators.required],
            time: [(favor as ServicesType).time ?? '', Validators.required],
          });

          // Добавляем новую группу в FormArray
          this._favors.push(favorGroup);
        } else {
          console.error('Полученные данные не содержат favor');
        }
      });
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  }

  // Функция для инициализации редактирования категорий
  private _editingCategoryInit(): void {
    this._categories.clear();
    this._choiceDialogVariant.set(DialogVariants.CATEGORY);
    this._categoryEdit.set(this._dataFavor.data);
    try {
      this._categoryService.getCategoryById(this._categoryEdit()?.id ?? '').subscribe(category => {
        if (category) {
          const favorGroup = this._fb.group({
            name: [(category as CategoriesType).name ?? '', Validators.required],
          });

          // Добавляем новую группу в FormArray
          this._categories.push(favorGroup);
        } else {
          console.error('Полученные данные не содержат favor');
        }
      });
    } catch (err) {
      console.log(err);
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

  protected _sendNewFavorsList(): void {
    const favors = this._favors?.value;
    favors?.forEach((favor: ServicesType) => {
      Object.assign(favor, { categoryId: this._choiceCategory });
    });

    from(favors).subscribe({
      next: (favor) => {
        this._favorService.createFavors(favor as ServicesType).subscribe({});
      },
      error: (err) => {
        this._showMessage('error', 'Ошибка при добавлении услуги');
        console.log(err);
      },
      complete: () => {
        this._showMessage('success', 'Услуга добавлена');
      },
    });
  }

  protected _updateFavor(): void {
    console.log(this._favorEdit());
  }

  protected _sendNewCategoriesList(): void {
    const categories = this._categories?.value;

    from(categories).subscribe({
      next: (favor) => {
        this._favorService.createFavors(favor as ServicesType).subscribe({});
      },
      error: (err) => {
        this._showMessage('error', 'Ошибка при добавлении услуги');
        console.log(err);
      },
      complete: () => {
        this._showMessage('success', 'Услуга добавлена');
      },
    });
  }

  protected _updateCategory(): void {
  }

  private _showMessage(status: string, msg: string): void {
    const message = SnackStatusesUtil.getStatuses(status, msg);
    if (message) {
      this._snackBar.add(message);
    }
  }
}
