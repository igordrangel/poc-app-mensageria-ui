import { CommonModule } from '@angular/common';
import { AppPageComponent } from './../../shared/components/app-page/app-page.componnet';
import { NgModule } from '@angular/core';
import { PageJobsComponent } from './page-jobs.component';
import { PageJobsRoutingModule } from './page-jobs.routing.module';
import { CatPrimaryButtonComponent } from '@catrx/ui/button';
import { CatConfirmModule } from '@catrx/ui/confirm';
import { CatDatatableModule } from '@catrx/ui/datatable';
import { CatDialogModule } from '@catrx/ui/dialog';
import { CatFormModule } from '@catrx/ui/form';
import { CatIconButtonModule } from '@catrx/ui/icon-button';
import { CatExpansivePanelModule } from '@catrx/ui/expansive-panel';
import { JobComponent } from './job/job.component';
import { CatLoaderModule } from '@catrx/ui/loader';
import { CatDropdownModule } from '@catrx/ui/dropdown';

@NgModule({
  declarations: [PageJobsComponent, JobComponent],
  imports: [
    CommonModule,
    AppPageComponent,
    CatFormModule,
    CatDatatableModule,
    CatDialogModule,
    CatConfirmModule,
    CatIconButtonModule,
    CatPrimaryButtonComponent,
    CatExpansivePanelModule,
    CatLoaderModule,
    CatDropdownModule,
    PageJobsRoutingModule
  ]
})
export class PageJobsModule { }
