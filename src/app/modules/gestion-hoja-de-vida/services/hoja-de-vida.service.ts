import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estudiante } from '../models/Estudiantehv';
import { gestion_hoja_vida } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HojaDeVidaService {

    private readonly apiUrl = `${gestion_hoja_vida.api_url}/hoja-vida/estudiantes`;

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

    filtrar(
        suficienciaIdiomaAprobada: boolean | null,
        semestreActual: number | null
    ): Observable<Estudiante[]> {
        let params = new HttpParams();

        if (suficienciaIdiomaAprobada !== null) {
            params = params.set(
                'suficienciaIdiomaAprobada',
                String(suficienciaIdiomaAprobada)
            );
        }

        if (semestreActual !== null) {
            params = params.set('semestreActual', String(semestreActual));
        }

        return this.http.get<Estudiante[]>(`${this.apiUrl}/filtrar`, { params });
    }

}
