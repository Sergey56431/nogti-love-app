import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';
import { ClientsService } from '@shared/services';
import { ClientType } from '@shared/types';
import { DialogService } from 'primeng/dynamicdialog';
import { AddNewClientCardComponent } from '@shared/components';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    TableModule,
    TableModule,
    Button,
    Tooltip,
    RouterLink,
  ],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsPageComponent implements OnInit {
  protected title = 'Клиенты';protected _clients= signal<ClientType[]>([]);

  constructor(private readonly _clientService: ClientsService,
              private readonly _dialogService: DialogService) {}

  public ngOnInit () {
    this._clientService.getAllClients().subscribe((clients) => {
      if (clients && clients.length > 0) {
        this._clients.set(clients);
      }
    });
  }

  protected _addNewClient() {
    this._dialogService.open(AddNewClientCardComponent, {
      width: '500px',
      header: 'Добавить нового клиента',
      modal: true,
      closeOnEscape: true,
      draggable: true,
      closable: true,
      contentStyle: {
        overflow: 'unset',
      }
    });
  }

  protected _deleteClient(userId: string) {
    console.log(`Пользователь с id '${userId}' удалён`);
  }

}
