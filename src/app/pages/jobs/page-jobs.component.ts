import { JobService } from './../../shared/services/job/job.service';
import { JobStatus, JobStatusOptions } from './../../shared/services/job/job.interface';
import { Component } from '@angular/core';
import { CatCRUDComponentBase } from '@catrx/ui/common';
import { CatDatatableService, DatatableConfig } from '@catrx/ui/datatable';
import { CatConfirmService } from '@catrx/ui/confirm';
import { CatDialogService } from '@catrx/ui/dialog';
import { CatFormListOptions, CatFormService } from '@catrx/ui/form';
import { CatLoaderPageService } from '@catrx/ui/loader-page';
import { CatSnackbarService } from '@catrx/ui/snackbar';
import { CatXlsxService } from '@catrx/ui/utils';
import { koala } from '@koalarx/utils';
import { CatChip } from '@catrx/ui/chip';
import { Router } from '@angular/router';

@Component({
  template: `
    <app-page>
      <cat-form filter [config]="filterForm"></cat-form>

      <cat-datatable content [config]="this.listConfig">
        <nav list-actions>
          <cat-icon-button
            (click)="export('Jobs')"
            class="mr-5"
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
export class PageJobsComponent extends CatCRUDComponentBase {
  filterForm = this.formService
    .build({status: ''})
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
      customWidthColumn: '150px'
    })
    .setItemLine({
      columnIndex: 2,
      text: (item) => item.type,
    })
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
