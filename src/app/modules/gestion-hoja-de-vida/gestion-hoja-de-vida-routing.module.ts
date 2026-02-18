import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuscarEstudianteComponent } from './pages/buscar-estudiante/buscar-estudiante.component';
import { InfoEstudianteComponent } from './pages/info-estudiante/info-estudiante.component';
import { HojaDeVidaPdfComponent } from './pages/hoja-de-vida-pdf/hoja-de-vida-pdf.component';

const routes: Routes = [
  { path: '', component: BuscarEstudianteComponent },
  { path: 'info-estudiante/:codigo', component: InfoEstudianteComponent },
  { path: 'hoja-de-vida-pdf/:codigo', component: HojaDeVidaPdfComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionHojaDeVidaRoutingModule { }
