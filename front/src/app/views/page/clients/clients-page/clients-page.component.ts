import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';
import { ClientsService } from '@shared/services';
import { ClientType } from '@shared/types';

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
  protected title = 'Клиенты';
  protected _clients= signal<ClientType[]>([]);

  constructor(private readonly _clientService: ClientsService) {}

  public ngOnInit () {
    this._clientService.getAllClients().subscribe((clients) => {
      if (clients && clients.length > 0) {
        this._clients.set(clients);
      }
    });
  }

  protected _deleteClient(userId: string) {
    console.log(`Пользователь с id '${userId}' удалён`);
  }

}
