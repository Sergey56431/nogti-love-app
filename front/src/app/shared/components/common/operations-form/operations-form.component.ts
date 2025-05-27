import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { createDispatchMap, select } from '@ngxs/store';
import { OperationCategoriesState, OperationsCategory, OperationsState, Transactions } from '@core/store';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core/auth';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { CreateOperationInterface } from '@shared/types/operations';

@Component({
  selector: 'app-operations-form',
  standalone: true,
  imports: [
    FloatLabel,
    ReactiveFormsModule,
    Select,
    InputNumber,
    Button,
  ],
  templateUrl: './operations-form.component.html',
  styleUrl: './operations-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsFormComponent implements OnInit {
  protected _isEdit = signal<boolean>(false);
  protected _selectedTypeOperation = signal<string>('');
  protected _canSelect = computed(() => {
    return !!this._selectedTypeOperation().length;
  });


  protected _operationCategory = computed(() => {
    if (this._selectedTypeOperation().length) {
      return this._operationCategories().filter(category => category.type === this._selectedTypeOperation());
    } else {
      return this._operationCategories();
    }
  });


  protected _operationType = [
    { name: 'Доход', type: 'income' },
    { name: 'Расход', type: 'expense' },
  ];

  private _operation = select(OperationsState.getOperation);
  private _operationCategories = select(OperationCategoriesState.getCategories);

  private readonly _fb = inject(FormBuilder);
  private readonly _ref = inject(DynamicDialogRef);
  private readonly _authService = inject(AuthService);
  private readonly _operationData = inject(DynamicDialogConfig);

  protected _operationForm = this._fb.group({
    userId: [this._authService.getUserInfo().userId],
    categoryId: ['', Validators.required],
    type: '',
    value: [0, [Validators.required, Validators.min(1)]],
  });

  get name() {
    return this._operationForm.get('name');
  }

  get type() {
    return this._operationForm.get('type');
  }

  get categoryId() {
    return this._operationForm.get('categoryId');
  }

  get value() {
    return this._operationForm.get('value');
  }

  private _actions = createDispatchMap({
    getOperation: Transactions.GetOperation,
    createOperation: Transactions.CreateOperation,
    editOperation: Transactions.UpdateOperation,
    getOperationCategories: OperationsCategory.UserOperationCategories,
  });

  public ngOnInit(): void {
    this._actions.getOperationCategories(this._authService.getUserInfo().userId ?? '');

    if (this._operationData.data.id) {
      this._isEdit.set(this._operationData.data.isEdit);
      this._actions.getOperation(this._operationData.data.id);
    }
    if (this._operationData.data.isEdit) {
      this._actions.getOperation(this._operationData.data.id);
      this._setFormValues();
    }
  }

  private _setFormValues() {
    this._operationForm.patchValue({
      categoryId: this._operation()?.id,
      type: this._operation()?.categoryOperations.type,
      value: this._operation()?.value,
    });
  }

  protected _editOperation() {
    this._actions.editOperation(this._operationForm.value as CreateOperationInterface, this._operationData.data.id);
    this._close();
  }

  protected _createOperation(): void {
    delete this._operationForm.value.type;
    this._actions.createOperation(this._operationForm.value as CreateOperationInterface);
    this._close();
  }

  protected _close() {
    this._ref.close();
  }
}
