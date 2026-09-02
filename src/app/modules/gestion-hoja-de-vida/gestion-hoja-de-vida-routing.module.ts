import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuscarEstudianteComponent } from './pages/buscar-estudiante/buscar-estudiante.component';
import { InfoEstudianteComponent } from './pages/info-estudiante/info-estudiante.component';
import { HojaDeVidaPdfComponent } from './pages/hoja-de-vida-pdf/hoja-de-vida-pdf.component';
import { HojaVidaAccessGuard } from './guards/hoja-vida-access.guard';

const routes: Routes = [
  {
    path: '',
    component: BuscarEstudianteComponent,
    canActivate: [HojaVidaAccessGuard],
    data: { tipoAcceso: 'buscar' }
  },
  {
    path: 'info-estudiante/:codigo',
    component: InfoEstudianteComponent,
    canActivate: [HojaVidaAccessGuard],
    data: { tipoAcceso: 'consultar' }
  },
  {
    path: 'hoja-de-vida-pdf/:codigo',
    component: HojaDeVidaPdfComponent,
    canActivate: [HojaVidaAccessGuard],
    data: { tipoAcceso: 'consultar' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionHojaDeVidaRoutingModule { }
