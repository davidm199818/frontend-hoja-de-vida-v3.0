import { Asignatura } from './Asignatura';
import { PasantiaInvestigacion } from './PasantiaInvestigacion';
import { Publicacion } from './Publicacion';
import { PracticaDocente } from './PracticaDocente';

export interface AreaAcademica {
  asignaturas: Asignatura[];
}

export interface EstudianteHistoriaAcademica {
  codigoEstudiante: string;
  nombreCompleto: string;
  correoUniversidad: string;
  tituloPregrado: string;
  fechaGrado: string;
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
  };
}

export interface HistoriaAcademica {
  estudiante: EstudianteHistoriaAcademica;
  historiaAcademica: HistoriaAcademicaData;
}
