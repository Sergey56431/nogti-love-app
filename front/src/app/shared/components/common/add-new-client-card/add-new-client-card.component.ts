import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { InputMask } from 'primeng/inputmask';
import { Button } from 'primeng/button';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientsService } from '@shared/services';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserInfoType } from '@shared/types';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { SnackStatusesUtil } from '@shared/utils';

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
  ],
  templateUrl: './add-new-client-card.component.html',
  styleUrl: './add-new-client-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNewClientCardComponent {

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _clientService: ClientsService,
    private readonly _toast: MessageService,
    private readonly _ref: DynamicDialogRef
  ) {}

  protected _newClientForm = this._fb.group({
    name: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    score: new FormControl(0),
  });

  protected get name(): string | null | undefined {
    return this._newClientForm.get('name')?.value;
  }

  protected get lastName(): string | null | undefined {
    return this._newClientForm.get('lastName')?.value;
  }

  protected get username(): string | null | undefined {
    return this._newClientForm.get('username')?.value;
  }

  protected get phoneNumber(): string | null | undefined {
    return this._newClientForm.get('phoneNumber')?.value;
  }

  protected get password(): string | null | undefined {
    return this._newClientForm.get('password')?.value;
  }

  protected get score(): number | null | undefined {
    return this._newClientForm.get('score')?.value;
  }


  protected _createClient() {
    const body: UserInfoType = {
      name: this._newClientForm.value.name ?? '',
      phoneNumber: this._newClientForm.value.phoneNumber ?? '',
      username: this._newClientForm.value.username ?? '',
      lastName: this._newClientForm.value.lastName ?? '',
      password: this._newClientForm.value.password ?? '',
      role: 'CLIENT',
      score: Number(this._newClientForm.value.score),
    };
    console.log(body);
    if (body){
      this._sendNewClient(body);
    }
  }

  private _sendNewClient(body: UserInfoType) {
    let message: ToastMessageOptions;
    this._clientService.createClient(body).subscribe({
      next: client => {
        message = SnackStatusesUtil.getStatuses('success', `Клиент "$${client?.name}" успешно добавлен`)!;
        this._close();
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

  protected _close() {
    this._ref.close();
  }
}
