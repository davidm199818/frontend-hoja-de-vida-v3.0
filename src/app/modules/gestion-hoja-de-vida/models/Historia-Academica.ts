import { Asignatura } from './Asignatura';
import { PasantiaInvestigacion } from './PasantiaInvestigacion ';
import { Publicacion } from './Publicacion ';
import { PracticaDocente } from './PracticaDocente ';

export interface HistoriaAcademica {
  codigoEstudiante: string;
  nombreCompleto: string;
  correoUniversidad: string;
  tituloPregrado: string;
  fechaGrado: string;

  fundamentacion: Asignatura[];
  electivas: Asignatura[];

  investigacion: {
    asignaturasVistas: Asignatura[];
    pasantias: PasantiaInvestigacion[];
    publicaciones: Publicacion[];
  };

  complementacion: {
    practicaDocente: PracticaDocente;
    competenciasEmpresariales: Asignatura[];
  };
}