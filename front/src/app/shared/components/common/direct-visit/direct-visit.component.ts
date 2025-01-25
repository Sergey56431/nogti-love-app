import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { InputMask } from 'primeng/inputmask';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { _closeDialogVia } from '@angular/material/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

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
    Button,
  ],
  templateUrl: './direct-visit.component.html',
  styleUrl: './direct-visit.component.scss',
})
export class DirectVisitComponent {
  private _ref: DynamicDialogRef | undefined;

  protected _timeVariant = [
    {
      name: '11:00 - 13:00',
      code: 1,
    },
    {
      name: '13:00 - 15:00',
      code: 2,
    },
    {
      name: '15:00 - 17:00',
      code: 3,
    },
  ];

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _snackbar: MatSnackBar,
  ) {}

  protected _newVisitor = this._fb.group({
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(
        '^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$',
      ),
    ]),
    dateVisit: new FormControl('', [Validators.required]),
    comment: new FormControl(''),
  });

  protected get _name() {
    return this._newVisitor.get('name');
  }

  protected get _phone() {
    return this._newVisitor.get('phone');
  }

  protected get _dateVisit() {
    return this._newVisitor.get('dateVisit');
  }

  protected _sendNewDirect() {
    this._snackbar.open(
      `Клиент ${this._name?.value} записан на время ${this._dateVisit?.value}`,
    );
    console.log(this._newVisitor.value);
  }

  protected _closeDialog() {
    this._ref?.close();
  }

  protected readonly _closeDialogVia = _closeDialogVia;
}
