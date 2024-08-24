import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DirectVisitComponent} from '@shared/components';

@Injectable({
  providedIn: 'root'
})
export class DialogOpenService {

    readonly dialog = inject(MatDialog);

    openWindow() {
      this.dialog.open(DirectVisitComponent, {
        width: '500px',
      });
    }
  }

