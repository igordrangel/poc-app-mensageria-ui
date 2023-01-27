import { CatToolbarModule } from '@catrx/ui/toolbar';
import { Component } from '@angular/core';
import { CatComponentBase } from "@catrx/ui/common";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page',
  template: `
    <cat-toolbar [config]="getToolbarInfo()">
      <nav buttons>
        <ng-content select='[menu]'></ng-content>
      </nav>
    </cat-toolbar>

    <div class="filter-content">
      <ng-content select='[filter]'></ng-content>
    </div>

    <section>
      <ng-content select='[content]'></ng-content>
    </section>
  `,
  styles: [`
    section {
      margin: 0 20px 10px;
      border-radius: 10px;
      border: 1px solid var(--shadow-color);
      overflow: hidden;
    }
    .filter-content {
      display: block;
      margin: 20px 20px 10px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    CatToolbarModule
  ],
})
export class AppPageComponent extends CatComponentBase {
}
