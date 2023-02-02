import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AppConfigMenu, CatAppDecodedToken, CatRoutePolice } from '@catrx/ui';

@Injectable()
export class AppService {
  public getMenu(decodedToken: CatAppDecodedToken) {
    this.buildPolices(decodedToken);
    return new Observable<AppConfigMenu>(observe => {
      observe.next({
        modules: [
          {
            icon: 'fa-solid fa-timeline',
            name: 'Jobs',
            routerLink: '/jobs',
            hasPermission: () => !!decodedToken
          }
        ]
      });
      observe.complete();
    })
  }

  private buildPolices(decodedToken: CatAppDecodedToken) {
    CatRoutePolice.police = (path: string) => {
      return (
        decodedToken &&
        !!['/jobs/'].find(
          (validPath) => path.indexOf(validPath) >= 0
        )
      );
    };
  }
}
