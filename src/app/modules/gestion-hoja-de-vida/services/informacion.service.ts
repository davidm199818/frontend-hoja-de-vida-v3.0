import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaAcademica } from '../models/Historia-Academica';

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

}
