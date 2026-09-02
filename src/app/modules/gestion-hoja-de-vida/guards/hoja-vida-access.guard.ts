import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    UrlTree,
} from '@angular/router';

import { AutenticacionService } from '../../gestion-autenticacion/services/autenticacion.service';

type TipoAccesoHojaVida = 'buscar' | 'consultar';

@Injectable({
    providedIn: 'root',
})
export class HojaVidaAccessGuard implements CanActivate {
    private readonly rutaAccesoDenegado = '/pages/access';

    constructor(
        private autenticacion: AutenticacionService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
        if (!this.autenticacion.isLoggedIn()) {
            this.autenticacion.login();
            return false;
        }

        const roles = this.autenticacion.getRole() ?? [];

        if (roles.includes('ROLE_COORDINADOR')) {
            return true;
        }

        if (!roles.includes('ROLE_ESTUDIANTE')) {
            return this.router.parseUrl(this.rutaAccesoDenegado);
        }

        const codigoAcademico = this.autenticacion
            .getLoggedInUser()
            ?.academicCode?.trim();

        if (!codigoAcademico) {
            return this.router.parseUrl(this.rutaAccesoDenegado);
        }

        const tipoAcceso = route.data['tipoAcceso'] as TipoAccesoHojaVida;
        const codigoSolicitado = route.paramMap.get('codigo');

        if (tipoAcceso === 'buscar' || codigoSolicitado !== codigoAcademico) {
            return this.router.createUrlTree([
                '/gestion-hoja-de-vida/info-estudiante',
                codigoAcademico,
            ]);
        }

        return true;
    }
}
