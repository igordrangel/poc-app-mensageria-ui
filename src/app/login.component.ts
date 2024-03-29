import { Component } from '@angular/core';
import { CatLogotypeApp, CatTokenService } from '@catrx/ui';
import { CatFormModule, CatFormService } from '@catrx/ui/form';
import {
  CatDynamicComponentDataInterface,
  CatDynamicComponentModule,
} from '@catrx/ui/dynamic-component';
import { Observable } from 'rxjs';
import { CatPrimaryButtonComponent } from '@catrx/ui/button/primary';
import { CatFormBase } from '@catrx/ui/common';
import { CommonModule } from '@angular/common';

@Component({
  template: `
    <form class="login-content" (submit)="submit($event)">
      <cat-dynamic-component
        class="logotype"
        [component]="data"
      ></cat-dynamic-component>

      <cat-form #form [config]="loginFormConfig"></cat-form>

      <cat-primary-button
        class="w-100"
        type="submit"
        [showLoader]="(submitLoader$ | async) === true"
      >
        Entrar
      </cat-primary-button>
    </form>
  `,
  styles: [
    `
      .login-content {
        width: 250px;
      }
      .logotype {
        display: block;
        width: 100px;
        height: 100px;
        margin: 0 auto 20px;
      }
      .logotype img {
        width: 100px;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    CatDynamicComponentModule,
    CatFormModule,
    CatPrimaryButtonComponent,
  ],
})
export class LoginComponent
  extends CatFormBase
  implements CatDynamicComponentDataInterface
{
  data?: CatLogotypeApp;

  loginFormConfig = this.formService
    .build()
    .text('Usuário', 'login', (builder) =>
      builder.focus().setRequired().generate()
    )
    .password('Senha', 'password', (builder) =>
      builder.setRequired().generate()
    )
    .onSubmit(
      (data) =>
        new Observable((observe) => {
          setTimeout(() => {
            this.tokenService.setDecodedToken(data, 'demo');
            observe.next();
            observe.complete();
          }, 1000);
        })
    )
    .generate();

  constructor(
    private formService: CatFormService,
    private tokenService: CatTokenService
  ) {
    super();
  }
}
