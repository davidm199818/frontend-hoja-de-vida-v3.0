import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';

import { GestionHojaDeVidaRoutingModule } from './gestion-hoja-de-vida-routing.module';
import { BuscarEstudianteComponent } from './pages/buscar-estudiante/buscar-estudiante.component';
import { InfoEstudianteComponent } from './pages/info-estudiante/info-estudiante.component';
import { HojaDeVidaPdfComponent } from './pages/hoja-de-vida-pdf/hoja-de-vida-pdf.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    BuscarEstudianteComponent,
    InfoEstudianteComponent,
    HojaDeVidaPdfComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GestionHojaDeVidaRoutingModule,
    ButtonModule,
    CardModule,
    PanelModule,
    InputTextModule,
    TableModule,
    RadioButtonModule
  ],
  exports: [
    BuscarEstudianteComponent,
    InfoEstudianteComponent
  ]
})
export class GestionHojaDeVidaModule { }
