import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { InformacionService } from '../../services/informacion.service';
import { HojaDeVidaPdfComponent } from './hoja-de-vida-pdf.component';

describe('HojaDeVidaPdfComponent', () => {
  it('debe crearse', () => {
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

    const component = new HojaDeVidaPdfComponent(
      route,
      informacionService,
      changeDetector
    );

    expect(component).toBeTruthy();
  });
});
