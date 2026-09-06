export interface ActividadPractica {
  nombreActividad: string;
  tipoActividad: string;
}

export interface PracticaDocente {
  creditosAsignados?: number;
  acta?: string;
  fechaActa?: string | null;
  horas?: number;
  actividades?: ActividadPractica[];
}
