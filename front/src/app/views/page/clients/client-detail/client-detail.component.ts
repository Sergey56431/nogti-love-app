import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ActivatedRoute } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { ClientsService } from '@shared/services';
import { UserInfoType } from '@shared/types';
import { Rating } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [Breadcrumb, NgOptimizedImage, Rating, FormsModule, Textarea],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent implements OnInit {
  protected title = 'Клиенты';
  protected _home = { label: 'Клиенты', routerLink: ['/clients'], icon: '' };
  protected breadcrumb = [{ label: 'Клиент (Здесь вставить имя)' }];

  private _clientId = signal<string>('');
  protected _client = signal<UserInfoType | undefined>(undefined);
  protected _clientRating = signal<number>(0);
  protected _clientDescription = signal<string>('');

  protected _editMode = signal<boolean>(false);

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _clientService: ClientsService,
  ) {}

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _sendClientDescription(body: Partial<UserInfoType>) {
    // Запрос на редактирование клиента (возможно нужно сделать его универсальным чтобы можно было обновлять любую инфу)
  }
}
