import { CatFormListOptions } from "@catrx/ui/form"

export interface Job {
  id?: number
  type: string
  status: JobStatus
  telemetryRPA: {
    dateExecuted: Date
    message: string
  }[]
  telemetryIntegration: {
    dateExecuted: Date
    message: string
  }[]
}

export type JobStatus = 'onQueue' | 'executingRPA' | 'executingIntegration' | 'error' | 'canceled' | 'done'
export const JobStatusOptions: CatFormListOptions[] = [
  { value: 'onQueue', name: 'Na Fila' },
  { value: 'executingRPA', name: 'Processando RPA' },
  { value: 'executingIntegration', name: 'Processando Integração' },
  { value: 'error', name: 'Error' },
  { value: 'canceled', name: 'Cancelado' },
  { value: 'done', name: 'Concluído' }
]

export interface JobFilter {
  id?: string;
  type?: string;
  status?: JobStatus;
}
