import {
  ChangeDetectionStrategy,
  Component, effect,
  inject,
  Injector,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DirectsClientType } from '@shared/types/directs-client.type';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ClientInfoType, UserInfoType } from '@shared/types';
import { ClientsService } from '@shared/services';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-client-card',
  imports: [InputText, Textarea, Button, Rating, FormsModule, NgClass],
  providers: [DynamicDialogRef],
  templateUrl: './client-card.component.html',
  styleUrl: './client-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCardComponent implements OnInit{

  modal = input<boolean>(false);
  directInfo = input<DirectsClientType | undefined>(undefined);
  close = output<boolean>();
  protected _usersFavorsList = signal<string>('');
  protected _userInfo = signal<UserInfoType | undefined>(undefined);

  private readonly _clientService = inject(ClientsService);
  private readonly _injector = inject(Injector);

  public ngOnInit(): void {
    effect(() => {
      this.getUser(this.directInfo());
      console.log(this.directInfo());
    }, {injector: this._injector});
  }

  private getUser(direct: DirectsClientType | undefined){
    if (direct != null) {
      this._clientService.fetchAdminClient(direct.id!).subscribe(client => {
        this._userInfo.set(client as ClientInfoType);
      });
      this._createUserFavorsList(direct);
    }
    console.log(this._directInfo());
    this._createUserFavorsList();
    this._clientService.fetchAdminClient(this._directInfo()?.clientId ?? '').subscribe(client => {
      this._userInfo.set(client as ClientInfoType);
    });
  }


  private _createUserFavorsList(direct: DirectsClientType | undefined) {
    if (direct != null){
      this._usersFavorsList.set(direct?.services?.map(item => item.service.name).join(', ') ?? '');
    }

  }

  protected _close() {
    this.close.emit(false);
  }
}
