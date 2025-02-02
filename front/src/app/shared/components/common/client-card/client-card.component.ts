import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DirectsClientType } from '@shared/types/directs-client.type';
import { UserInfoType } from '@shared/types';

@Component({
  selector: 'app-client-card',
  standalone: true,
  imports: [InputText, Textarea, Button],
  templateUrl: './client-card.component.html',
  styleUrl: './client-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCardComponent implements OnInit {
  protected _directInfo = signal<DirectsClientType | undefined>(undefined);
  protected _clientInfo = signal<UserInfoType | undefined>(undefined);

  constructor(private config: DynamicDialogConfig) {}

  ngOnInit(): void {
    this._directInfo.set(this.config.data);
  }
}
