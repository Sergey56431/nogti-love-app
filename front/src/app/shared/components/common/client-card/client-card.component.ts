import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DirectsClientType } from '@shared/types/directs-client.type';

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

  constructor(private _config: DynamicDialogConfig,
              private readonly _ref: DynamicDialogRef) {}

  ngOnInit(): void {
    this._directInfo.set(this._config.data);
  }

  protected _close() {
    this._ref.close();
  }
}
