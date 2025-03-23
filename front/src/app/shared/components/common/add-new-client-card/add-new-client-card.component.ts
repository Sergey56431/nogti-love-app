import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { InputMask } from 'primeng/inputmask';
import { Button } from 'primeng/button';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientsService } from '@shared/services';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClientInfoType, UserInfoType } from '@shared/types';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';
import { InputNumber } from 'primeng/inputnumber';
import { AuthService } from '@core/auth';

@Component({
  selector: 'app-add-new-client-card',
  standalone: true,
  imports: [
    FloatLabel,
    InputText,
    Password,
    InputMask,
    Button,
    ReactiveFormsModule,
    InputNumber,
  ],
  templateUrl: './add-new-client-card.component.html',
  styleUrl: './add-new-client-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNewClientCardComponent {

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _authService: AuthService,
    private readonly _clientService: ClientsService,
    private readonly _toast: MessageService,
    private readonly _ref: DynamicDialogRef
  ) {}

  protected _newClientForm = this._fb.group({
    name: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    score: new FormControl(0),
  });

  protected _createClient() {
    const master = this._authService.getUserInfo();
    const body: ClientInfoType = {
      name: this._newClientForm.value.name ?? '',
      phoneNumber: this._newClientForm.value.phoneNumber ?? '',
      lastName: this._newClientForm.value.lastName ?? '',
      password: this._newClientForm.value.password ?? '',
      score: Number(this._newClientForm.value.score),
      masterId: master?.userId,
    };
    console.log(body);
    if (body){
      this._sendNewClient(body);
    }
  }

  private _sendNewClient(body: UserInfoType) {
    let message: ToastMessageOptions;
    this._clientService.createNewClient(body).subscribe({
      next: client => {
        message = SnackStatusesUtil.getStatuses('success', `Клиент "${client?.name}" успешно добавлен`)!;
        this._close('cancel');
      },
      error: err => {
        message = SnackStatusesUtil.getStatuses('success', 'Клиент не добавлен, проиошла ошибка')!;
        console.log(err);
      },
      complete: () => {
        this._toast.add(message);
      }
    });
  }

  protected _close(cancel?: string): void {
    this._ref.close(cancel);
  }
}
