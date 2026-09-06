import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AutenticacionService } from '../../../gestion-autenticacion/services/autenticacion.service';
import {
    PerfilAccesoDemo,
    PerfilDemo,
} from '../../models/AccesoDemo';
import { AccesoDemoService } from '../../services/acceso-demo.service';

@Component({
    selector: 'app-acceso-demo',
    templateUrl: './acceso-demo.component.html',
    styleUrls: ['./acceso-demo.component.scss'],
})
export class AccesoDemoComponent implements OnInit {
    perfiles: PerfilAccesoDemo[] = [];
    cargandoPerfiles = true;
    perfilEnProceso: PerfilDemo | null = null;
    error = '';

    constructor(
        private accesoDemoService: AccesoDemoService,
        private autenticacionService: AutenticacionService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.accesoDemoService
            .listarPerfiles()
            .pipe(finalize(() => (this.cargandoPerfiles = false)))
            .subscribe({
                next: (perfiles) => (this.perfiles = perfiles),
                error: () => {
                    this.error =
                        'No fue posible cargar los perfiles. Comprueba que el backend esté ejecutándose en modo demo.';
                },
            });
    }

    ingresar(perfil: PerfilAccesoDemo): void {
        if (this.perfilEnProceso) {
            return;
        }

        this.error = '';
        this.perfilEnProceso = perfil.perfil;

        this.accesoDemoService
            .crearSesion(perfil.perfil)
            .pipe(finalize(() => (this.perfilEnProceso = null)))
            .subscribe({
                next: (sesion) => {
                    this.autenticacionService.establecerSesionDemo(
                        sesion.accessToken,
                        sesion.expiresAt,
                        sesion.nombre,
                        sesion.rol,
                        sesion.codigoAcademico
                    );

                    if (
                        sesion.perfil === 'ESTUDIANTE' &&
                        sesion.codigoAcademico
                    ) {
                        this.router.navigate([
                            '/gestion-hoja-de-vida/info-estudiante',
                            sesion.codigoAcademico,
                        ]);
                        return;
                    }

                    this.router.navigate(['/gestion-hoja-de-vida']);
                },
                error: (response) => {
                    this.error =
                        response?.error?.mensaje ||
                        'No fue posible iniciar la sesión temporal.';
                },
            });
    }

    icono(perfil: PerfilDemo): string {
        return perfil === 'COORDINADOR'
            ? 'fa-solid fa-user-tie'
            : 'fa-solid fa-user-graduate';
    }

    descripcion(perfil: PerfilDemo): string {
        return perfil === 'COORDINADOR'
            ? 'Consulta estudiantes y administra sus distinciones académicas.'
            : 'Consulta únicamente la información de su propia hoja de vida.';
    }
}
