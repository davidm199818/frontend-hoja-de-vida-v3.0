import { Asignatura } from './Asignatura';
import { PasantiaInvestigacion } from './PasantiaInvestigacion';
import { Publicacion } from './Publicacion';
import { PracticaDocente } from './PracticaDocente';

export interface AreaAcademica {
  asignaturas: Asignatura[];
}

export type ModalidadAcademica = 'INVESTIGACION' | 'PROFUNDIZACION';
export type EstadoMaestria =
  | 'ACTIVO'
  | 'MAESTRIA_FINALIZADA'
  | 'RETIRADO'
  | 'EN_SUSPENCION';

export interface GrupoInvestigacion {
  sigla: string;
  nombre: string;
}

export interface EstudianteHistoriaAcademica {
  codigoEstudiante: string;
  nombreCompleto: string;
  correoUniversidad: string;
  periodoIngreso?: string | null;
  promedioCarrera?: number | string | null;
  estadoMaestria?: EstadoMaestria | null;
  modalidadAcademica?: ModalidadAcademica | null;
  grupoInvestigacion?: GrupoInvestigacion | null;
}

export interface HistoriaAcademicaData {
  fundamentacion: AreaAcademica;
  electivas: AreaAcademica;

  investigacion: {
    asignaturas: Asignatura[];
    pasantias: PasantiaInvestigacion[];
    publicaciones: Publicacion[];
  };

  complementacion: {
    practicasDocentes: PracticaDocente[];
    competenciasEmpresariales: AreaAcademica;
  };

  informacionAdicional: {
    creditosCumplidos: number;
    tituloTesis: string | null;
    directorTesis: string;
    codirectorTesis: string;
    asignaturas?: Asignatura[];
    distincionesAcademicas?: string[];
  };
}

export interface HistoriaAcademica {
  estudiante: EstudianteHistoriaAcademica;
  historiaAcademica: HistoriaAcademicaData;
}
