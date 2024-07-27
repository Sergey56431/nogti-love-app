import { Component } from '@angular/core';
import {NgForOf} from "@angular/common";
import {max} from "rxjs";

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent {

  protected dateCount = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
  protected readonly max = max;
}
