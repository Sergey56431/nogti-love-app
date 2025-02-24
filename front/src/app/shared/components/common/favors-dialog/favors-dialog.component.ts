import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ServicesType } from '@shared/types';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FavorsService } from '@shared/services';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { CategoriesType } from '@shared/types/categories.type';
import { Select, SelectItem } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { InputMask } from 'primeng/inputmask';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-favors-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    Tooltip,
    Select,
    SelectItem,
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
 * - Создать динамическую форму для формирования массива услуг/категорий который потоком будет перебираться и отправляться на сервер
 * - Запретить создавать услуги если нет хотя бы одной категории
 * - В случае редактирования отправлять одиночные запросы
 */
export class FavorsDialogComponent implements OnInit {
  private _favorInfo = signal<ServicesType | undefined>(undefined);
  protected _choiceCategory = signal<CategoriesType | undefined>(undefined);
  protected _categories: CategoriesType[] = [];

  private readonly _dataFavor = inject(DynamicDialogConfig);
  private readonly _favorService = inject(FavorsService);
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
    if (this._dataFavor.data) {
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
    }
  }

  protected _createNewFields(): void {
    this._favors.push(this._fb.group({
      name: ['', Validators.required],
      price: [0, Validators.required],
      time: ['', Validators.required],
    }));
  }
}
