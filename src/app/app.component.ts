import { Component } from '@angular/core';
import { CatAppService } from '@catrx/ui';
import { AppService } from './app.service';
import { LoginComponent } from './login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  appConfig = this.catAppService
    .build(
      'Messenger Manager',
      {
        autoAuth: true,
        startedPage: () => 'jobs',
        jwt: {
          loginComponent: LoginComponent,
        },
        onAuth: (decodedToken) => this.appService.getMenu(decodedToken),
      },
      { menuStartState: 'closed', disableCollapseMenuButton: true }
    )
    .setLogotype({ default: '../assets/logotype.svg' })
    .setDefaultTheme('dark')
    .generate();

  constructor(
    private catAppService: CatAppService,
    private appService: AppService
  ) {}
}
