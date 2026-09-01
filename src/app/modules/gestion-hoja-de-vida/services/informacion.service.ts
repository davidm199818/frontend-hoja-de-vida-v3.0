import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaAcademica } from '../models/Historia-Academica';

export type TipoDistincionAcademica =
  | 'EXCELENCIA_ACADEMICA'
  | 'MENCION_HONOR_TRABAJO_GRADO';

@Injectable({
  providedIn: 'root'
})
export class InformacionService {

  private apiUrl = 'http://localhost:8080/api/hoja-vida/estudiantes';

  constructor(private http: HttpClient) {}

  getHistoriaAcademica(codigoEstudiante: string): Observable<HistoriaAcademica> {
    return this.http.get<HistoriaAcademica>(
      `${this.apiUrl}/${codigoEstudiante}/historia-academica`
    );
  }

  registrarDistincion(
    codigoEstudiante: string,
    tipo: TipoDistincionAcademica,
    numeroResolucion: string,
    fechaResolucion: string,
    resolucion: File
  ): Observable<void> {
    const formData = new FormData();
    formData.append('tipo', tipo);
    formData.append('numeroResolucion', numeroResolucion.trim());
    formData.append('fechaResolucion', fechaResolucion);
    formData.append('resolucion', resolucion, resolucion.name);

    return this.http.post<void>(
      `${this.apiUrl}/${encodeURIComponent(codigoEstudiante)}/distinciones`,
      formData
    );
  }

  obtenerResolucionDistincion(
    codigoEstudiante: string,
    tipo: TipoDistincionAcademica
  ): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${encodeURIComponent(codigoEstudiante)}/distinciones/${tipo}/resolucion`,
      { responseType: 'blob' }
    );
  }

}
