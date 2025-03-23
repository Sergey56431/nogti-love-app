import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DirectsClientType } from '@shared/types/directs-client.type';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ClientInfoType, UserInfoType } from '@shared/types';
import { ClientsService } from '@shared/services';

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [InputText, Textarea, Button, Rating, FormsModule],
  templateUrl: './client-card.component.html',
  styleUrl: './client-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCardComponent implements OnInit {
  protected _directInfo = signal<DirectsClientType | undefined>(undefined);
  protected _usersFavorsList = signal<string>('');
  protected _userInfo = signal<UserInfoType | undefined>(undefined);

  constructor(private readonly _config: DynamicDialogConfig,
              private readonly _clientService: ClientsService,
              private readonly _ref: DynamicDialogRef) {}

  ngOnInit(): void {
    if (!this._config.data) {
      this._directInfo.set(this._config.data);
    }
    this._createUserFavorsList();
    this._clientService.fetchAdminClient(this._directInfo()?.userId ?? '').subscribe(client => {
      this._userInfo.set(client as ClientInfoType);
    });
  }

  private _createUserFavorsList() {
    this._usersFavorsList.set(this._directInfo()?.services?.map(item => item.service.name).join(', ') ?? '');
  }

  protected _close() {
    this._ref.close();
  }
}
