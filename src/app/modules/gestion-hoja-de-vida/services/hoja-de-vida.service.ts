import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estudiante } from '../models/Estudiantehv';

@Injectable({
    providedIn: 'root'
})
export class HojaDeVidaService {

    private apiUrl = 'http://localhost:8080/api/hoja-vida/estudiantes';

    constructor(private http: HttpClient) { }

    guardarPersona(persona: Estudiante): Observable<Estudiante> {
        return this.http.post<Estudiante>(this.apiUrl, persona);
    }

    listarEstudiantes(): Observable<Estudiante[]> {
        return this.http.get<Estudiante[]>(this.apiUrl);
    }

    buscar(valor: string): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(
      `${this.apiUrl}/buscar`, { params: { valor } }
    );
  }

}