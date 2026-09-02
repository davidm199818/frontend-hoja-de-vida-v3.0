import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

import { AutenticacionService } from '../../gestion-autenticacion/services/autenticacion.service';
import { HojaVidaAccessGuard } from './hoja-vida-access.guard';

describe('HojaVidaAccessGuard', () => {
    let autenticacion: jasmine.SpyObj<AutenticacionService>;
    let router: jasmine.SpyObj<Router>;
    let guard: HojaVidaAccessGuard;

    beforeEach(() => {
        autenticacion = jasmine.createSpyObj<AutenticacionService>(
            'AutenticacionService',
            ['isLoggedIn', 'login', 'getRole', 'getLoggedInUser']
        );
        router = jasmine.createSpyObj<Router>('Router', [
            'parseUrl',
            'createUrlTree',
        ]);
        guard = new HojaVidaAccessGuard(autenticacion, router);
        autenticacion.isLoggedIn.and.returnValue(true);
    });

    it('permite al coordinador abrir el buscador', () => {
        autenticacion.getRole.and.returnValue(['ROLE_COORDINADOR']);

        expect(guard.canActivate(ruta('buscar'))).toBeTrue();
    });

    it('redirige al estudiante desde el buscador hacia su propia hoja de vida', () => {
        const redireccion = {} as UrlTree;
        autenticacion.getRole.and.returnValue(['ROLE_ESTUDIANTE']);
        autenticacion.getLoggedInUser.and.returnValue(usuario('2024001'));
        router.createUrlTree.and.returnValue(redireccion);

        expect(guard.canActivate(ruta('buscar'))).toBe(redireccion);
        expect(router.createUrlTree).toHaveBeenCalledOnceWith([
            '/gestion-hoja-de-vida/info-estudiante',
            '2024001',
        ]);
    });

    it('permite al estudiante consultar su propia hoja de vida', () => {
        autenticacion.getRole.and.returnValue(['ROLE_ESTUDIANTE']);
        autenticacion.getLoggedInUser.and.returnValue(usuario('2024001'));

        expect(guard.canActivate(ruta('consultar', '2024001'))).toBeTrue();
    });

    it('redirige al estudiante si intenta consultar otro código', () => {
        const redireccion = {} as UrlTree;
        autenticacion.getRole.and.returnValue(['ROLE_ESTUDIANTE']);
        autenticacion.getLoggedInUser.and.returnValue(usuario('2024001'));
        router.createUrlTree.and.returnValue(redireccion);

        expect(guard.canActivate(ruta('consultar', '2024999'))).toBe(
            redireccion
        );
    });

    function ruta(
        tipoAcceso: 'buscar' | 'consultar',
        codigo: string | null = null
    ): ActivatedRouteSnapshot {
        return {
            data: { tipoAcceso },
            paramMap: {
                get: () => codigo,
            },
        } as unknown as ActivatedRouteSnapshot;
    }

    function usuario(academicCode: string) {
        return {
            username: 'Estudiante',
            email: 'estudiante@unicauca.edu.co',
            role: ['ROLE_ESTUDIANTE'],
            phoneNumber: '',
            academicCode,
            firstName: 'Estudiante',
            lastName: 'Prueba',
            idType: 'CC',
            idNumber: '123',
        };
    }
});
