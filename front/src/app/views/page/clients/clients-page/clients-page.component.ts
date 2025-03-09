import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';
import { ClientsService } from '@shared/services';
import { ClientType } from '@shared/types';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddNewClientCardComponent } from '@shared/components';
import {
  ConfirmationService,
  MessageService,
  ToastMessageOptions,
} from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { orderBy } from 'lodash';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [
    TableModule,
    Tooltip,
    RouterLink,
    ConfirmDialogModule,
    ToastModule,
    ButtonModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsPageComponent implements OnInit {
  private _ref: DynamicDialogRef | undefined;
  protected title = 'Клиенты';
  protected _clients = signal<ClientType[]>([]);

  constructor(
    private readonly _clientService: ClientsService,
    private readonly _dialogService: DialogService,
    private readonly _confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) {}

  public ngOnInit() {
    this._fetchAllClients();
  }

  private _fetchAllClients() {
    this._clientService.getAllClients().subscribe((clients) => {
      if (clients && clients.length > 0) {
        this._clients.set(orderBy(clients, 'name', 'asc'));
      }
    });
  }

  protected _addNewClient() {
    this._ref = this._dialogService.open(AddNewClientCardComponent, {
      width: '500px',
      header: 'Добавить нового клиента',
      modal: true,
      closeOnEscape: true,
      draggable: false,
      closable: true,
      contentStyle: {
        overflow: 'unset',
      },
    });
    this._ref.onClose.subscribe(() => {
      this._fetchAllClients();
    });
  }

  protected _deleteClient(client: ClientType) {
    let message: ToastMessageOptions;
    this._confirmationService.confirm({
      message: `Вы уверены, что хотите удалить клиента "${client?.name}"?`,
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      closeOnEscape: true,
      rejectButtonProps: {
        label: 'Отмена',
        severity: 'secondary',
        outlined: true,
        icon: 'pi pi-times',
      },
      acceptButtonProps: {
        severity: 'danger',
        outlined: false,
        icon: 'pi pi-trash',
        label: 'Удалить',
      },
      accept: () => {
        if (client != null) {
          try {
            this._clientService.deleteClient(client.id!).subscribe({
              next: (user) => {
                message = SnackStatusesUtil.getStatuses(
                  'success',
                  `Клиент ${user?.name} успешно удалён`,
                )!;
              },
              error: (err) => {
                message = SnackStatusesUtil.getStatuses(
                  'error',
                  'Невозможно удалить клиента',
                )!;
                this.messageService.add(message);
                console.log(err);
              },
              complete: () => {
                this.messageService.add(message);
                this._fetchAllClients();
              },
            });
          } catch (e) {
            message = SnackStatusesUtil.getStatuses(
              'error',
              'Невозможно выполнит операцию',
            )!;
            this.messageService.add(message);
            console.log(e);
          }
        }
      },
      reject: () => {
        //empty
      },
    });
  }
}
