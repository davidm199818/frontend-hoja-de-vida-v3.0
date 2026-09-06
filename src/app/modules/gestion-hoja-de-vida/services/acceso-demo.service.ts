import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { gestion_hoja_vida } from 'src/environments/environment';

import {
    PerfilAccesoDemo,
    PerfilDemo,
    SesionDemo,
} from '../models/AccesoDemo';

@Injectable({
    providedIn: 'root',
})
export class AccesoDemoService {
    private readonly apiUrl = `${gestion_hoja_vida.api_url}/demo/auth`;

    constructor(private http: HttpClient) {}

    listarPerfiles(): Observable<PerfilAccesoDemo[]> {
        return this.http.get<PerfilAccesoDemo[]>(`${this.apiUrl}/perfiles`);
    }

    crearSesion(perfil: PerfilDemo): Observable<SesionDemo> {
        return this.http.post<SesionDemo>(`${this.apiUrl}/token`, { perfil });
    }
}
