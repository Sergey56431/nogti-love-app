import { Component, OnInit } from '@angular/core';
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
import { ButtonModule } from 'primeng/button';
import { _closeDialogVia } from '@angular/material/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DirectsType } from '@shared/types/directs.type';
import { DirectsService, FavorsServiceService } from '@shared/services';
import { CategoriesService } from '@shared/services/categories';
import { CategoriesType } from '@shared/types/categories.type';

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
  ],
  templateUrl: './direct-visit.component.html',
  styleUrl: './direct-visit.component.scss',
})
export class DirectVisitComponent implements OnInit {

  protected _categories: CategoriesType[] = [];
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

  constructor(private readonly _fb: FormBuilder,
              private readonly _directsService: DirectsService,
              private readonly _categoryService: CategoriesService,
              private readonly _favorService: FavorsServiceService,
              private readonly _snackbar: MatSnackBar,
              private readonly _ref: DynamicDialogRef) {}

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

  public ngOnInit() {
    try {
      this._categoryService.getAllCategories().subscribe(categories => {
        this._categories = categories;
        console.log(this._categories);
      });
    } catch (err) {
      console.log(err);
    }

  }

  protected _closeDialog() {
    this._ref?.close();
  }

  protected _createDirect() {
    const data: DirectsType = {
      clientName: '',
      date: '',
      comment: '',
      phone: '',
      time: '',
      services: [],
    };
    this._directsService.createDirect(data).subscribe();
  }

  protected readonly _closeDialogVia = _closeDialogVia;
}
