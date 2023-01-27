import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatAuthGuard } from '@catrx/ui/core';
import { JobComponent } from './job/job.component';
import { PageJobsComponent } from './page-jobs.component';

const routes: Routes = [
  { path: '', component: PageJobsComponent, canActivate: [CatAuthGuard] },
  { path: ':id', component: JobComponent, canActivate: [CatAuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageJobsRoutingModule { }
