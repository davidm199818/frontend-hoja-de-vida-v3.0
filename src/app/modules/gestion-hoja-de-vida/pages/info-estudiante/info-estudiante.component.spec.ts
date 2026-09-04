import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { AutenticacionService } from '../../../gestion-autenticacion/services/autenticacion.service';
import { InformacionService } from '../../services/informacion.service';
import { InfoEstudianteComponent } from './info-estudiante.component';

describe('InfoEstudianteComponent', () => {
  let component: InfoEstudianteComponent;
  let router: jasmine.SpyObj<Router>;
  let informacionService: jasmine.SpyObj<InformacionService>;
  let autenticacion: jasmine.SpyObj<AutenticacionService>;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {
    const route = {
      snapshot: {
        paramMap: { get: () => '2024001' }
      }
    } as unknown as ActivatedRoute;
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    informacionService = jasmine.createSpyObj<InformacionService>(
      'InformacionService',
      [
        'getHistoriaAcademica',
        'registrarDistincion',
        'obtenerDetalleDistincion',
        'obtenerResolucionDistincion'
      ]
    );
    informacionService.getHistoriaAcademica.and.returnValue(of({} as any));
    autenticacion = jasmine.createSpyObj<AutenticacionService>(
      'AutenticacionService',
      ['hasRole']
    );
    sanitizer = jasmine.createSpyObj<DomSanitizer>(
      'DomSanitizer',
      ['bypassSecurityTrustResourceUrl']
    );
    sanitizer.bypassSecurityTrustResourceUrl.and.returnValue(
      'blob:resolucion' as unknown as SafeResourceUrl
    );

    component = new InfoEstudianteComponent(
      route,
      router,
      informacionService,
      sanitizer,
      autenticacion
    );
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe identificar al coordinador', () => {
    autenticacion.hasRole.and.returnValue(true);

    expect(component.esCoordinador).toBeTrue();
    expect(autenticacion.hasRole).toHaveBeenCalledOnceWith('ROLE_COORDINADOR');
  });

  it('debe impedir que un estudiante registre distinciones', () => {
    autenticacion.hasRole.and.returnValue(false);

    component.registrarDistincion();

    expect(component.errorDistincion).toBe(
      'No tiene permisos para registrar distinciones.'
    );
    expect(informacionService.registrarDistincion).not.toHaveBeenCalled();
  });

  it('debe cargar los datos guardados al editar una distinción', () => {
    autenticacion.hasRole.and.returnValue(true);
    informacionService.obtenerDetalleDistincion.and.returnValue(of({
      tipo: 'EXCELENCIA_ACADEMICA',
      numeroResolucion: 'RES-EXC-001',
      fechaResolucion: '2025-01-15'
    }));

    component.abrirFormularioEdicion('EXCELENCIA_ACADEMICA');

    expect(informacionService.obtenerDetalleDistincion)
      .toHaveBeenCalledOnceWith('2024001', 'EXCELENCIA_ACADEMICA');
    expect(component.tipoDistincionEdicion).toBe('EXCELENCIA_ACADEMICA');
    expect(component.numeroResolucionEdicion).toBe('RES-EXC-001');
    expect(component.fechaResolucionEdicion).toBe('2025-01-15');
  });

  it('debe usar el número de resolución como nombre de descarga', () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:resolucion');
    informacionService.obtenerResolucionDistincion.and.returnValue(of(
      new HttpResponse({
        body: new Blob(['%PDF-prueba'], { type: 'application/pdf' }),
        headers: new HttpHeaders({
          'Content-Disposition': 'inline; filename="RES-EXC-001.pdf"'
        })
      })
    ));

    component.verResolucion('EXCELENCIA_ACADEMICA');

    expect(component.nombreArchivoResolucion).toBe('RES-EXC-001.pdf');
    expect(component.urlDescargaResolucion).toBe('blob:resolucion');
  });
});
