import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { InputMask } from 'primeng/inputmask';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FormBuilder } from '@angular/forms';
import { UsersService } from '@shared/services';

@Component({
  selector: 'app-add-new-client-card',
  standalone: true,
  imports: [FloatLabel, InputText, Password, InputMask, Select, Button],
  templateUrl: './add-new-client-card.component.html',
  styleUrl: './add-new-client-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNewClientCardComponent {

  constructor(private readonly _fb: FormBuilder,
              private readonly _clientService: UsersService){}

  protected _close () {
    // empty
  }

  protected _createClient() {
    // empty
  }
}
