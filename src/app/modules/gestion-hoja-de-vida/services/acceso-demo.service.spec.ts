import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PerfilAccesoDemo, SesionDemo } from '../models/AccesoDemo';
import { AccesoDemoService } from './acceso-demo.service';
import { gestion_hoja_vida } from 'src/environments/environment';

describe('AccesoDemoService', () => {
    let service: AccesoDemoService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        gestion_hoja_vida.api_url = '/api';
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(AccesoDemoService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
        gestion_hoja_vida.api_url = 'http://localhost:8080/api';
    });

    it('consulta los perfiles habilitados por el backend', () => {
        const perfiles: PerfilAccesoDemo[] = [
            {
                perfil: 'COORDINADOR',
                nombre: 'Coordinador de demostración',
                rol: 'ROLE_COORDINADOR',
                codigoAcademico: null,
            },
        ];

        service.listarPerfiles().subscribe((response) => {
            expect(response).toEqual(perfiles);
        });

        const request = httpTestingController.expectOne(
            '/api/demo/auth/perfiles'
        );
        expect(request.request.method).toBe('GET');
        request.flush(perfiles);
    });

    it('solicita el token para el perfil seleccionado', () => {
        const sesion: SesionDemo = {
            perfil: 'ESTUDIANTE',
            nombre: 'Estudiante de prueba',
            rol: 'ROLE_ESTUDIANTE',
            codigoAcademico: 'IS20260157',
            accessToken: 'jwt-demo',
            tokenType: 'Bearer',
            expiresAt: '2026-09-06T12:00:00Z',
        };

        service.crearSesion('ESTUDIANTE').subscribe((response) => {
            expect(response).toEqual(sesion);
        });

        const request = httpTestingController.expectOne('/api/demo/auth/token');
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ perfil: 'ESTUDIANTE' });
        request.flush(sesion);
    });
});
