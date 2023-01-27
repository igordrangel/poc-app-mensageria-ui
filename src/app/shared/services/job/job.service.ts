import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CatServiceBase } from '@catrx/ui/common';
import { CatDatatableDataHttpResponse } from '@catrx/ui/datatable';
import { koala } from '@koalarx/utils';
import { map, Observable } from 'rxjs';
import { Job, JobFilter } from './job.interface';

@Injectable({providedIn: 'root'})
export class JobService extends CatServiceBase<JobFilter, Job[], Job> {
  constructor(http: HttpClient) {
    super(http, 'jobs', {
      useMockup: true,
      mockupStartBase: [
        {
          id: 1,
          type: 'Google Scrapping',
          status: 'onQueue',
          telemetryRPA: [],
          telemetryIntegration: []
        }
      ]
    })
  }

  getDatatable(filter: JobFilter): Observable<CatDatatableDataHttpResponse<Job>> {
    return this.getAll(filter).pipe(map(jobsBase => {
      const jobs = koala(jobsBase)
        .array<Job>()
        .filter(filter?.id ?? '', 'id')
        .filter(filter?.type ?? '', 'type')
        .filter(filter?.status ?? '', 'status')
        .getValue();

      return {
        items: jobs,
        count: jobs.length
      };
    }))
  }

  exportPets(filter: JobFilter) {
    return this.exportByService(() => this.getDatatable(filter));
  }
}
