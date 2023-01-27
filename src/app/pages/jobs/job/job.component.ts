import { CatSnackbarService } from '@catrx/ui/snackbar';
import { CatLoaderPageService } from '@catrx/ui/loader-page';
import { JobService } from './../../../shared/services/job/job.service';
import { Job, JobStatus } from './../../../shared/services/job/job.interface';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { delay } from '@koalarx/utils/operators/delay';

interface JobStatusButton {
  icon: string
  status: JobStatus
  text: string
}

@Component({
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.css']
})
export class JobComponent implements OnInit {
  currentStatus$ = new BehaviorSubject<JobStatusButton | null>(null);
  job$ = new BehaviorSubject<Job | null>(null);

  constructor(
    private activatedRoute: ActivatedRoute,
    private jobService: JobService,
    private loaderPageService: CatLoaderPageService,
    private snackbarService: CatSnackbarService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.jobService
        .getById(parseInt(params['id']))
        .subscribe(job => {
          this.job$.next(job);
          this.currentStatus$.next(this.getStatusInfo(job.status));
          if (job.status === 'onQueue') this.simulate();
        })
    })
  }

  cancel() {
    this.loaderPageService.show();
    this.updateStatusJob('canceled')
      .then(() => {
        this.snackbarService.open({
          type: 'success',
          title: 'Job cancelado com sucesso!',
          openedTime: 10000
        })
        this.loaderPageService.dismiss()
      })
      .catch(() => this.loaderPageService.dismiss());
  }

  backToQueue() {
    this.loaderPageService.show();
    this.updateStatusJob('onQueue')
      .then(() => {
        this.snackbarService.open({
          type: 'success',
          title: 'Job retomado com sucesso!',
          openedTime: 10000
        })
        this.loaderPageService.dismiss()
        this.simulate()
      })
      .catch(() => this.loaderPageService.dismiss());
  }

  private getStatusInfo(status: JobStatus): JobStatusButton {
    switch (status) {
      case 'onQueue':
        return {
          status,
          icon: 'fa-solid fa-circle-dot',
          text: 'Na Fila'
        }
      case 'executingRPA':
        return {
          status,
          icon: 'fa-solid fa-forward',
          text: 'Processando RPA'
        }
      case 'executingIntegration':
        return {
          status,
          icon: 'fa-solid fa-forward',
          text: 'Processando Integração'
        }
      case 'error':
        return {
          status,
          icon: 'fa-solid fa-bug',
          text: 'Error'
        }
      case 'canceled':
        return {
          status,
          icon: 'fa-solid fa-ban',
          text: 'Cancelado'
        }
      case 'done':
        return {
          status,
          icon: 'fa-solid fa-circle-check',
          text: 'Concluído'
        }
    }
  }

  private simulate() {
    return new Promise(async resolve => {
      await delay(2000);
      await this.updateStatusJob('executingRPA');
      await delay(2000);
      await this.updateStatusJob('executingIntegration');
      await delay(2000);
      await this.updateStatusJob('done');
    })
  }

  private updateStatusJob(status: JobStatus) {
    return new Promise(resolve => {
      const job = this.job$.getValue();
      if (job && (job.status !== 'canceled' || status === 'onQueue')) {
        job.status = status;
        if (status === 'onQueue') {
          job.telemetryRPA = [];
          job.telemetryIntegration = [];
        }
        this.jobService.save(job, job.id).subscribe(async () => {
          this.currentStatus$.next(this.getStatusInfo(job.status));
          await this.simulateTelemetry(status);
          resolve(true);
        });
      } else {
        resolve(true);
      }
    })
  }

  private simulateTelemetry(status: JobStatus) {
    return new Promise(async resolve => {
      const job = this.job$.getValue();
      if (job) {
        if (status === 'executingRPA') {
          job.telemetryRPA.push({ dateExecuted: new Date(), message: 'Abrindo navegador...' })
          await delay(1000);
          job.telemetryRPA.push({ dateExecuted: new Date(), message: 'Navegador aberto.' })
          await delay(1000);
          job.telemetryRPA.push({ dateExecuted: new Date(), message: 'Carregando página...' })
          await delay(1000);
          job.telemetryRPA.push({ dateExecuted: new Date(), message: 'Página carregada.' })
          await delay(1000);
          job.telemetryRPA.push({ dateExecuted: new Date(), message: 'Realizando busca...' })
          await delay(1000);
          job.telemetryRPA.push({ dateExecuted: new Date(), message: 'Busca realizada.' })
          await delay(1000);
          job.telemetryRPA.push({ dateExecuted: new Date(), message: 'Coletando dados...' })
          await delay(1000);
          job.telemetryRPA.push({ dateExecuted: new Date(), message: 'Dados coletados com sucesso!' })
        } else if (status === 'executingIntegration') {
          job.telemetryIntegration.push({ dateExecuted: new Date(), message: 'Autenticando a API...' })
          await delay(1000);
          job.telemetryIntegration.push({ dateExecuted: new Date(), message: 'API autenticada.' })
          await delay(1000);
          job.telemetryIntegration.push({ dateExecuted: new Date(), message: 'Enviando dados...' })
          await delay(1000);
          job.telemetryIntegration.push({ dateExecuted: new Date(), message: 'Dados enviados com sucesso!' })
        }
      }
      resolve(true);
    })
  }
}
