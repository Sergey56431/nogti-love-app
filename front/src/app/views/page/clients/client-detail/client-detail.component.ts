import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ClientsService } from '@shared/services';
import { ClientInfoType, UserInfoType } from '@shared/types';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';
import { MenuItem, MessageService, ToastMessageOptions } from 'primeng/api';
import { ToggleButton } from 'primeng/togglebutton';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { SnackStatusesUtil } from '@shared/utils';

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
  protected title = 'Клиенты';
  protected _newScore = signal<number | string | null>(null);
  private _clientId = signal<string>('');

  protected _client = signal<ClientInfoType | undefined>(undefined);
  protected _clientRating = signal<number>(0);
  protected _clientDescription = signal<string>('');

  protected _editMode = signal<boolean>(false);

  protected _home = { label: 'Клиенты', routerLink: ['/clients'], icon: '' };
  protected _breadcrumb: Signal<MenuItem[] | undefined> = computed(() => {
    return [{ label: `${this._client()?.lastName} ${this._client()?.name}` }];
  });

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _toast: MessageService,
    private readonly _clientService: ClientsService,
  ) {}

  public ngOnInit() {
    this._activatedRoute.params.subscribe((params) => {
      this._clientId.set(params['id']);
      this._clientService.fetchAdminClient(this._clientId()).subscribe((client) => {
        if (client as ClientInfoType) {
          this._client.set(client as ClientInfoType);
        }
      });
    });
  }

  protected _reset(): void {
    this._clientRating.set(0);
    this._clientDescription.set('');
    this._newScore.set(null);
    this._editMode.set(false);
  }

  protected _saveNewInfo(): void {
    const data: Partial<UserInfoType> = {} as Partial<UserInfoType>;
    if (this._clientRating() != 0) {
      Object.assign(data, { rate: this._clientRating() });
    }
    if (this._clientDescription() != '') {
      Object.assign(data, { description: this._clientDescription() });
    }
    if (this._newScore() != null) {
      Object.assign(data, { score: this._newScore() });
    }
    if (Object.keys(data).length > 0) {
      this._sendClientDescription(data);
    } else {
      const message = SnackStatusesUtil.getStatuses('error', 'Не указана информация для редактирования')!;
      this._toast.add(message);
    }
  }

  private _sendClientDescription(data: Partial<UserInfoType>) {
    let message: ToastMessageOptions;
    this._clientService.updateClientData(this._clientId(), data).subscribe({
      next: client => {
        this._client.set(client);
        message= SnackStatusesUtil.getStatuses('success', 'Информация успешно обновлена')!;
      }, error: err => {
        message= SnackStatusesUtil.getStatuses('error', 'Ошибка при обновлении информации')!;
        console.error(err);
      },
      complete: () => {
        this._toast.add(message);
      }
    });
  }
}
