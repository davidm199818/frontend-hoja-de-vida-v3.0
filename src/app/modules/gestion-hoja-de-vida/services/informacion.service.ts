import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaAcademica } from '../models/Historia-Academica';

export type TipoDistincionAcademica =
  | 'EXCELENCIA_ACADEMICA'
  | 'MENCION_HONOR_TRABAJO_GRADO';

export interface DistincionAcademicaDetalle {
  tipo: TipoDistincionAcademica;
  numeroResolucion: string;
  fechaResolucion: string;
}

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
    formData.append(
      'resolucion',
      resolucion,
      this.crearNombreArchivoResolucion(numeroResolucion)
    );

    return this.http.post<void>(
      `${this.apiUrl}/${encodeURIComponent(codigoEstudiante)}/distinciones`,
      formData
    );
  }

  editarDistincion(
    codigoEstudiante: string,
    tipo: TipoDistincionAcademica,
    numeroResolucion: string,
    fechaResolucion: string,
    resolucion?: File | null
  ): Observable<void> {
    const formData = new FormData();
    formData.append('numeroResolucion', numeroResolucion.trim());
    formData.append('fechaResolucion', fechaResolucion);
    if (resolucion) {
      formData.append(
        'resolucion',
        resolucion,
        this.crearNombreArchivoResolucion(numeroResolucion)
      );
    }

    return this.http.put<void>(
      `${this.apiUrl}/${encodeURIComponent(codigoEstudiante)}/distinciones/${tipo}`,
      formData
    );
  }

  obtenerDetalleDistincion(
    codigoEstudiante: string,
    tipo: TipoDistincionAcademica
  ): Observable<DistincionAcademicaDetalle> {
    return this.http.get<DistincionAcademicaDetalle>(
      `${this.apiUrl}/${encodeURIComponent(codigoEstudiante)}/distinciones/${tipo}`
    );
  }

  eliminarDistincion(
    codigoEstudiante: string,
    tipo: TipoDistincionAcademica
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${encodeURIComponent(codigoEstudiante)}/distinciones/${tipo}`
    );
  }

  obtenerResolucionDistincion(
    codigoEstudiante: string,
    tipo: TipoDistincionAcademica
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(
      `${this.apiUrl}/${encodeURIComponent(codigoEstudiante)}/distinciones/${tipo}/resolucion`,
      { responseType: 'blob', observe: 'response' }
    );
  }

  private crearNombreArchivoResolucion(numeroResolucion: string): string {
    const codigo = numeroResolucion
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/^[.-]+|[.-]+$/g, '');

    return `${codigo || 'resolucion'}.pdf`;
  }

}
