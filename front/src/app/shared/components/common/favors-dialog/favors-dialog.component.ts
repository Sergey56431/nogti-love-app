import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DefaultResponseType, ServicesType } from '@shared/types';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FavorsService } from '@shared/services';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { CategoriesType } from '@shared/types/categories.type';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { InputMask } from 'primeng/inputmask';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { CategoriesService } from '@shared/services/categories';
import { catchError, combineLatestAll, from, Observable } from 'rxjs';
import { SnackStatusesUtil } from '@shared/utils';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-favors-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    Tooltip,
    Select,
    FloatLabel,
    InputMask,
    InputNumber,
    InputText,
  ],
  templateUrl: './favors-dialog.component.html',
  styleUrl: './favors-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

/* TODO
 * - В случае редактирования отправлять одиночные запросы
 */
export class FavorsDialogComponent implements OnInit {
  private _favorInfo = signal<ServicesType | undefined>(undefined);
  protected _choiceCategory = signal<string>('');
  protected _categories = signal<CategoriesType[]>([]);

  protected _isEdit = signal<boolean>(false);

  private readonly _dataFavor = inject(DynamicDialogConfig);
  private readonly _favorService = inject(FavorsService);
  private readonly _categoryService = inject(CategoriesService);
  private readonly _snackBar = inject(MessageService);
  private readonly _fb = inject(FormBuilder);

  protected _favorsListForm: FormGroup = this._fb.group({
    favors: this._fb.array([
      this._fb.group({
        name: ['', Validators.required],
        price: [0, Validators.required],
        time: ['', Validators.required],
      }),
    ]),
  });

  protected get _favors() {
    return this._favorsListForm.get('favors') as FormArray;
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
          this._categories.set(categories as CategoriesType[]);
        }
      });
    if (this._dataFavor.data) {
      this._isEdit.set(true);
      this._favorInfo.set(this._dataFavor.data);
      try {
        this._favorService
          .getFavorsById(this._favorInfo()?.id ?? '')
          .subscribe((favor) => {
            console.log(favor);
          });
      } catch (error) {
        console.log(error);
      }
    } else {
      this._isEdit.set(false);
    }
  }

  protected _createNewFields(): void {
    this._favors.push(
      this._fb.group({
        name: ['', Validators.required],
        price: [0, Validators.required],
        time: ['', Validators.required],
      }),
    );
  }

  protected _sendNewFavorsList(): void {
    const favors = this._favorsListForm.get('favors')?.value;
    favors?.forEach((favor: ServicesType) => {
      Object.assign(favor, { categoryId: this._choiceCategory() });
    });

    from(favors).subscribe({
      next: (favor) => {
        this._favorService.createFavors(favor as ServicesType).subscribe({
        });
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

  private _showMessage(status: string, msg: string): void {
    const message = SnackStatusesUtil.getStatuses(status, msg);
    if (message) {
      this._snackBar.add(message);
    }
  }
}
