import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { InformacionService } from '../../services/informacion.service';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import { HojaDeVidaPdfComponent } from './hoja-de-vida-pdf.component';

describe('HojaDeVidaPdfComponent', () => {
  let component: HojaDeVidaPdfComponent;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const route = {
      snapshot: {
        paramMap: { get: () => '2024001' }
      }
    } as unknown as ActivatedRoute;
    const informacionService = jasmine.createSpyObj<InformacionService>(
      'InformacionService',
      ['getHistoriaAcademica']
    );
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const changeDetector = jasmine.createSpyObj<ChangeDetectorRef>(
      'ChangeDetectorRef',
      ['detectChanges']
    );

    component = new HojaDeVidaPdfComponent(
      route,
      router,
      informacionService,
      changeDetector
    );
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe volver a la información del estudiante consultado', () => {
    component.codigoEstudiante = '2024001';

    component.volver();

    expect(router.navigate).toHaveBeenCalledWith([
      '/gestion-hoja-de-vida/info-estudiante',
      '2024001'
    ]);
  });

  it('debe mostrar la información académica del estudiante activo', () => {
    component.historia = {
      estudiante: {
        codigoEstudiante: '2024001',
        nombreCompleto: 'Estudiante de prueba',
        correoUniversidad: 'estudiante@unicauca.edu.co',
        estadoMaestria: 'ACTIVO',
        modalidadAcademica: 'INVESTIGACION',
        grupoInvestigacion: {
          nombre: 'Grupo de I+D en Tecnologías de la Información',
          sigla: 'GTI'
        }
      }
    } as HistoriaAcademica;

    expect(component.estadoMaestriaLabel)
      .toBe('Estudiante activo de la Maestría en Computación - Universidad del Cauca');
    expect(component.modalidadAcademicaLabel).toBe('Investigación');
    expect(component.grupoInvestigacionLabel)
      .toBe('Grupo de I+D en Tecnologías de la Información (GTI)');
  });
});
