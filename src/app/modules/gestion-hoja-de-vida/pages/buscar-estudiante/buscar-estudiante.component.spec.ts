import { Router } from '@angular/router';
import { of } from 'rxjs';

import { Estudiante } from '../../models/Estudiantehv';
import { HojaDeVidaService } from '../../services/hoja-de-vida.service';
import { BuscarEstudianteComponent } from './buscar-estudiante.component';

describe('BuscarEstudianteComponent', () => {
  let component: BuscarEstudianteComponent;
  let router: jasmine.SpyObj<Router>;
  let hojaDeVidaService: jasmine.SpyObj<HojaDeVidaService>;

  const estudiante: Estudiante = {
    codigo: '2023002',
    identificacion: '987654321',
    nombre: 'Carlos',
    apellido: 'Pérez',
    periodoIngreso: '2023-2',
    semestreActual: 4
  };

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    hojaDeVidaService = jasmine.createSpyObj<HojaDeVidaService>(
      'HojaDeVidaService',
      ['buscar', 'listarEstudiantes', 'filtrar']
    );
    hojaDeVidaService.listarEstudiantes.and.returnValue(of([]));
    component = new BuscarEstudianteComponent(router, hojaDeVidaService);
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe aplicar los filtros seleccionados y volver a la primera página', () => {
    hojaDeVidaService.filtrar.and.returnValue(of([estudiante]));
    component.suficienciaIdiomaAprobada = false;
    component.semestreActual = 4;
    component.page = 2;

    component.aplicarFiltros();

    expect(hojaDeVidaService.filtrar).toHaveBeenCalledOnceWith(false, 4);
    expect(component.estudiantes).toEqual([estudiante]);
    expect(component.page).toBe(0);
    expect(component.cargando).toBeFalse();
  });

  it('debe limpiar los filtros y cargar nuevamente todos los estudiantes', () => {
    component.suficienciaIdiomaAprobada = true;
    component.semestreActual = 2;

    component.limpiarFiltros();

    expect(component.suficienciaIdiomaAprobada).toBeNull();
    expect(component.semestreActual).toBeNull();
    expect(hojaDeVidaService.listarEstudiantes).toHaveBeenCalled();
  });
});
