import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { DirectsClientType } from '@shared/types';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-direct-item',
  imports: [
    Tooltip,
    Menu,
  ],
  templateUrl: './client-item.html',
  styleUrl: './client-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectItem {

  modal = input<boolean>(false);
  direct = input<DirectsClientType | undefined>(undefined);
  showInfo = output<DirectsClientType>();
  delete = output();

  protected _menuItems: MenuItem[] = [
    {
      label: 'Подробнее',
      icon: 'pi pi-eye',
      command: () => {
        if (!this.modal()) {
          this.showInfo.emit(this.direct()!);
        }
      }
    },
    {
      label: 'Редактировать',
      icon: 'pi pi-pencil',
      command: () => {
       //
      }
    },
    {
      label: 'Удалить',
      icon: 'pi pi-times',
      styleClass: 'deleteItem',
      command: () => {
        this.delete.emit();
      }
    },
  ];
}
