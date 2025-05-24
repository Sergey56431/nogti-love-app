import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { AuthService } from '@core/auth';
import { InputText } from 'primeng/inputtext';
import { createDispatchMap, select } from '@ngxs/store';
import { OperationCategoriesState, OperationsCategory } from '@core/store';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';
import { OperationCategoryInterface } from '@shared/types/operations';

@Component({
  selector: 'app-category-operation-form',
  standalone: true,
  imports: [
    FloatLabel,
    ReactiveFormsModule,
    Select,
    InputText,
    Button,
  ],
  templateUrl: './category-operation-form.component.html',
  styleUrl: './category-operation-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryOperationFormComponent implements OnInit {
  private readonly _ref = inject(DynamicDialogRef);
  protected _isEdit = signal<boolean>(false);
  private _category = computed(() => {
    return this._selectedCategory();
  });
  private readonly _selectedCategory = select(OperationCategoriesState.getCategory);

  protected readonly _operationType = [
    {
      type: 'expense',
      name: 'Расход',
    },
    {
      type: 'income',
      name: 'Доход',
    },
  ];

  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _categoryData = inject(DynamicDialogConfig);

  protected _categoryOperationForm  = this._fb.group({
    type: ['expense'],
    name: ['', Validators.required],
    userId: [this._authService.getUserInfo().userId]
  });

  protected get type() {
    return this._categoryOperationForm.get('type');
  }

  protected get name() {
    return this._categoryOperationForm.get('name');
  }

  private readonly _actions = createDispatchMap({
    addCategory: OperationsCategory.AddOperationCategory,
    getCategory: OperationsCategory.GetOperationCategory,
    updateCategory: OperationsCategory.UpdateOperationCategory,
  });

  public ngOnInit(): void {
    if (this._categoryData.data.isEdit) {
      this._isEdit.set(true);
      this._actions.getCategory(this._categoryData.data.id);
      this._setCategoryFormValue();
    }
  }

  private _setCategoryFormValue () {
    console.log(this._selectedCategory());
    this._categoryOperationForm.patchValue({
      type: this._category().type,
      name: this._category().name,
    });
  }

  protected _createCategory() {
    this._actions.addCategory(this._categoryOperationForm.value as OperationCategoryInterface);
    this._close();
  }

  protected _editCategory () {
    this._actions.updateCategory({
      ...this._categoryOperationForm.value,
      id: this._category().id
    } as OperationCategoryInterface);
    this._close();
  };

  protected _close() {
    this._ref.close();
  }
}
