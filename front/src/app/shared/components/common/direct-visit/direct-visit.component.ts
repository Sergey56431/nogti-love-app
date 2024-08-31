import { Component } from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-direct-visit',
  standalone: true,
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatDialogContent,
    MatDialogTitle,
    MatLabel,
    MatError,
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatSelect,
    MatOption
  ],
  templateUrl: './direct-visit.component.html',
  styleUrl: './direct-visit.component.scss'
})
export class DirectVisitComponent {

  constructor(private _fb: FormBuilder) {}

  protected _newVisitor = this._fb.group({
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.pattern('^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$')]),
    dateVisit: new FormControl('', [Validators.required]),
    comment: new FormControl('',),
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

  protected _sendNewDirect(){

  }

}
