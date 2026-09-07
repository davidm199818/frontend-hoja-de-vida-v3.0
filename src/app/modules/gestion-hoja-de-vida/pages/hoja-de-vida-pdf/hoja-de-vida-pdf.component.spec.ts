import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { InformacionService } from '../../services/informacion.service';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import { HojaDeVidaPdfComponent } from './hoja-de-vida-pdf.component';

describe('HojaDeVidaPdfComponent', () => {
  let component: HojaDeVidaPdfComponent;

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
    const changeDetector = jasmine.createSpyObj<ChangeDetectorRef>(
      'ChangeDetectorRef',
      ['detectChanges']
    );

    component = new HojaDeVidaPdfComponent(
      route,
      informacionService,
      changeDetector
    );
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
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
