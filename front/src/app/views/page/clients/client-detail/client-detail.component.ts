import { ChangeDetectionStrategy, Component, computed, effect, OnInit, Signal, signal } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ClientsService } from '@shared/services';
import { UserInfoType } from '@shared/types';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { MenuItem } from 'primeng/api';
import { ToggleButton } from 'primeng/togglebutton';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    Breadcrumb,
    NgOptimizedImage,
    Rating,
    FormsModule,
    Textarea,
    ToggleButton,
    InputNumber,
    Button,
  ],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent implements OnInit {
  protected readonly Number = Number;
  protected title = 'Клиенты';
  protected _newScore = signal<number | string | null>(null);
  private _clientId = signal<string>('');

  protected _client = signal<UserInfoType | undefined>(undefined);
  protected _clientRating = signal<number>(0);
  protected _clientDescription = signal<string>('');

  protected _isActionShow = signal<boolean>(false);
  protected _editMode = signal<boolean>(false);
  protected _infoChanged = signal<boolean>(false);

  protected _home = { label: 'Клиенты', routerLink: ['/clients'], icon: '' };
  protected _breadcrumb: Signal<MenuItem[] | undefined> = computed(() => {
    return [{ label: `${this._client()?.lastName} ${this._client()?.name}` }];
  });

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _clientService: ClientsService,
  ) {
    // effect(() => {
    //   if (this._editMode()) {
    //    this._infoChanged.set(true);
    //   } else if(!this._editMode()) {
    //     this._infoChanged.set(false);
    //   }
    //   if (this._newScore() != undefined && this._client()?.score !== this._newScore()) {
    //     this._isActionShow.set(true);
    //   }
    //   // if (this._clientRating() !== 0 || (this._client()?.rate && this._client()?.rate !== this._clientRating())) {
    //   //   this._isActionShow.set(true);
    //   // }
    //   if (this._clientDescription() !== this._client()?.description) {
    //     this._isActionShow.set(true);
    //   } else {
    //     this._isActionShow.set(false);
    //   }
    //
    // }, { allowSignalWrites: true });
  }

  public ngOnInit() {
    this._activatedRoute.params.subscribe((params) => {
      this._clientId.set(params['id']);
      this._clientService.getClient(this._clientId()).subscribe((client) => {
        if (client) {
          this._client.set(client);
          console.log(this._client());
        }
      });
    });
  }

  protected _reset(): void {

  }

  protected _saveNewInfo(): void {
    const body: Partial<UserInfoType> = {

    };

    this._sendClientDescription(body);
  }

  private _sendClientDescription(body: Partial<UserInfoType>) {
    console.log(body);
    // Запрос на редактирование клиента (возможно нужно сделать его универсальным чтобы можно было обновлять любую инфу)
  }


}
