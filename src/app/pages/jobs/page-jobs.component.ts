import { JobService } from './../../shared/services/job/job.service';
import { Job, JobStatus, JobStatusOptions, JobFilter } from './../../shared/services/job/job.interface';
import { Component } from '@angular/core';
import { CatCRUDComponentBase } from '@catrx/ui/common';
import { CatDatatableService } from '@catrx/ui/datatable';
import { CatConfirmService } from '@catrx/ui/confirm';
import { CatDialogService } from '@catrx/ui/dialog';
import { CatFormListOptions, CatFormService } from '@catrx/ui/form';
import { CatLoaderPageService } from '@catrx/ui/loader-page';
import { CatSnackbarService } from '@catrx/ui/snackbar';
import { CatXlsxService } from '@catrx/ui/utils';
import { CatAlertService } from '@catrx/ui/alert';
import { koala } from '@koalarx/utils';
import { CatChip } from '@catrx/ui/chip';
import { Router } from '@angular/router';
import { first, forkJoin } from 'rxjs';

@Component({
  template: `
    <app-page>
      <nav menu>
        <cat-primary-button (click)='openDialog()'>Novo Job</cat-primary-button>
      </nav>

      <cat-form filter [config]="filterForm"></cat-form>

      <cat-datatable content [config]="this.listConfig">
        <nav list-checked-actions>
          <cat-icon-button
            (click)="deleteSelected()"
            icon="fa-solid fa-trash-can"
            tooltip="Excluir Selecionados">
          </cat-icon-button>
          <cat-icon-button
            (click)="cancelSelected()"
            icon="fa-solid fa-ban"
            tooltip="Cancelar Selecionados">
          </cat-icon-button>
          <cat-icon-button
            (click)="backToQueueSelected()"
            icon="fa-solid fa-rotate-right"
            tooltip="Retomar Selecionados">
          </cat-icon-button>
        </nav>

        <nav list-actions>
          <cat-icon-button
            (click)="export('Jobs')"
            icon="fa-solid fa-download"
            tooltip="Exportar Lista">
          </cat-icon-button>
          <cat-icon-button
            (click)="reloadList()"
            icon="fa-solid fa-rotate"
            tooltip="Recarregar Lista">
          </cat-icon-button>
        </nav>
      </cat-datatable>
    </app-page>
  `
})
export class PageJobsComponent extends CatCRUDComponentBase<JobFilter, Job> {
  filterForm = this.formService
    .build({ status: '' })
    .number('ID', 'id', (builder) => builder.grid(3).generate())
    .search('Tipo', 'type', (builder) => builder.grid(3).generate())
    .select('Status', 'status', (builder) =>
      builder
        .setOptions(
          koala([{ value: '', name: 'Todos' }])
            .array<CatFormListOptions>()
            .merge(JobStatusOptions)
            .getValue()
        )
        .grid(3)
        .generate()
    )
    .onChange((filter) => this.filterValueChanges$.next(filter))
    .generate();

  listConfig = this.datatableService
    .build(this.filterValueChanges$, filter =>
      this.service.getDatatable(filter)
    )
    .setColumns(['Job', 'Status', 'Tipo'])
    .setActionButton({
      iconName: 'fa-regular fa-eye',
      tooltip: 'Visualizar Job',
      fnAction: (item) => this.router.navigateByUrl(
        `${location.hash.replace('#', '')}/${item.id}`
      ),
    })
    .setItemLine({
      columnIndex: 0,
      text: (item) => `#${item.id}`,
      customWidthColumn: '150px'
    })
    .setItemLine({
      columnIndex: 1,
      component: (item) => this.convertStatusToChip(item.status),
      customWidthColumn: '220px'
    })
    .setItemLine({
      columnIndex: 2,
      text: (item) => item.type,
    })
    .hasSelection()
    .hasActions()
    .getSelection((selection) => (this.selection = selection))
    .getDatasource((datasource) => (this.datasource = datasource))
    .generate();

  constructor(
    formService: CatFormService,
    datatableService: CatDatatableService,
    loaderService: CatLoaderPageService,
    snackbarService: CatSnackbarService,
    dialogService: CatDialogService,
    confirmService: CatConfirmService,
    xlsxService: CatXlsxService,
    private alertService: CatAlertService,
    private router: Router,
    protected override service: JobService
  ) {
    super(
      formService,
      datatableService,
      service,
      loaderService,
      snackbarService,
      dialogService,
      confirmService,
      { xlsx: xlsxService }
    );
  }

  openDialog(data?: Job) {
    this.openFormDialog(
      this.formService
        .build<Job>(data)
        .text('Tipo', 'type', (builder) =>
          builder.focus().setRequired().generate()
        )
        .onSubmit((job) => this.service
          .save({
            ...job,
            status: 'onQueue',
            telemetryRPA: [],
            telemetryIntegration: []
          }, data?.id)
        )
        .generate(),
      !!data,
      { title: 'Job' }
    );
  }

  cancelSelected() {
    this.confirmService?.ask(
      'Você realmente deseja cancelar os itens selecionados?',
      () => {
        if (this.selection?.selected) {
          if (this.selection.selected.find(lineItem =>
            lineItem.item.status === 'canceled' ||
            lineItem.item.status === 'done'
          )) {
            this.alertService.show({
              type: 'warning',
              message: 'Existem um ou mais jobs que não são permitidos o cancelamento.'
            })
          } else {
            this.loaderService?.show();
            forkJoin(this.selection.selected.map(lineItem => {
              const job = lineItem.item;
              job.status = 'canceled';
              return this.service.save(job, job.id);
            })).pipe(first())
              .subscribe({
                next: () => {
                  this.snackbarService?.open({
                    title: 'Jobs cancelados com sucesso!',
                    type: 'success',
                    openedTime: 10000
                  });
                  this.loaderService?.dismiss();
                  this.reloadList();
                },
                error: () => {
                  this.snackbarService?.open({
                    title: 'Ocorreu um error ao tentar cancelar um ou mais jobs.',
                    type: 'error',
                    openedTime: 10000
                  });
                  this.loaderService?.dismiss();
                }
              })
          }
        }
      }
    )
  }

  backToQueueSelected() {
    this.confirmService?.ask(
      'Você realmente deseja retomar os itens selecionados?',
      () => {
        if (this.selection?.selected) {
          if (this.selection.selected.find(lineItem =>
            lineItem.item.status !== 'canceled' &&
            lineItem.item.status !== 'error'
          )) {
            this.alertService.show({
              type: 'warning',
              message: 'Existem um ou mais jobs que não são permitidos a retomada para a fila.'
            })
          } else {
            this.loaderService?.show();
            forkJoin(this.selection.selected.map(lineItem => {
              const job = lineItem.item;
              job.status = 'onQueue';
              return this.service.save(job, job.id);
            })).pipe(first())
              .subscribe({
                next: () => {
                  this.snackbarService?.open({
                    title: 'Jobs retomados com sucesso!',
                    type: 'success',
                    openedTime: 10000
                  });
                  this.loaderService?.dismiss();
                  this.reloadList();
                },
                error: () => {
                  this.snackbarService?.open({
                    title: 'Ocorreu um error ao tentar retomar um ou mais jobs.',
                    type: 'error',
                    openedTime: 10000
                  });
                  this.loaderService?.dismiss();
                }
              })
          }
        }
      }
    )
  }

  export(filename: string): void {
    this.exportByService(
      {
        xlsx: { filename, sheetName: 'Jobs' },
      },
      this.service.exportPets(this.filterValueChanges$.getValue())
    );
  }

  private convertStatusToChip(status: JobStatus): CatChip {
    switch (status) {
      case 'onQueue':
        return new CatChip('Na Fila', 'warning');
      case 'executingRPA':
        return new CatChip('Processando RPA', 'primary');
      case 'executingIntegration':
        return new CatChip('Processando Integração', 'primary');
      case 'error':
        return new CatChip('Error', 'danger');
      case 'canceled':
        return new CatChip('Cancelado', 'secondary');
      case 'done':
        return new CatChip('Concluído', 'success');
    }
  }
}
