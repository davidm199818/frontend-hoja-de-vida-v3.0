import { Component, OnInit } from '@angular/core';
import { InformacionService } from '../../services/informacion.service';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import { Asignatura } from '../../models/Asignatura';
import { Router } from '@angular/router';

interface TableRow {
  periodo: string;
  codigo: string;
  nombre: string;
  creditos: number;
  nota: string;
}

@Component({
  selector: 'app-info-estudiante',
  templateUrl: './info-estudiante.component.html',
  styleUrls: ['./info-estudiante.component.scss']
})
export class InfoEstudianteComponent implements OnInit {

  codigoEstudiante = '67_23021063814012'; // Usa uno real del backend

  historia!: HistoriaAcademica;

  activeMenuItem: string = 'fundamentacion';
  currentTable: string | null = null;

  expandedMenu: { [key: string]: boolean } = {
    investigacion: false,
    complementacion: false
  };

  mostrarDialogoConfirmacionGenerarHojaDeVida = false;

  fundamentacionData: TableRow[] = [];
  electivasData: TableRow[] = [];
  asignaturasVistasData: TableRow[] = [];
  competenciasEmpresarialesData: TableRow[] = [];

  constructor(
    private router: Router,
    private infoService: InformacionService
  ) {}

  ngOnInit(): void {
    this.cargarHistoriaAcademica();
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  cargarHistoriaAcademica(): void {
    this.infoService.getHistoriaAcademica(this.codigoEstudiante)
      .subscribe(data => {
        this.historia = data;

        // Mapear datos automáticamente
        this.fundamentacionData = this.mapAsignaturas(data.fundamentacion);
        this.electivasData = this.mapAsignaturas(data.electivas);
        this.asignaturasVistasData = this.mapAsignaturas(data.investigacion.asignaturasVistas);
        this.competenciasEmpresarialesData =
          this.mapAsignaturas(data.complementacion.competenciasEmpresariales);
      });
  }

  toggleSubmenu(menu: string): void {
    this.expandedMenu[menu] = !this.expandedMenu[menu];
  }

  selectMenuItem(item: string): void {
    this.activeMenuItem = item;
    this.currentTable = item;
  }

  private mapAsignaturas(asignaturas: Asignatura[]): TableRow[] {
    return asignaturas.map(a => ({
      periodo: a.periodoCursado,
      codigo: a.codigoMateria,
      nombre: a.nombreMateria,
      creditos: a.creditos,
      nota: a.notaDefinitiva?.toString() ?? 'Sin nota'
    }));
  }

  /* ================= PDF ================= */

  mostrarConfirmacionGenerarHojaDeVida(): void {
    this.mostrarDialogoConfirmacionGenerarHojaDeVida = false;

  this.router.navigate([
    '/gestion-hoja-de-vida/hoja-de-vida-pdf/1'
  ]);
  }

  confirmarGeneracionHojaDeVida(): void {
    this.mostrarDialogoConfirmacionGenerarHojaDeVida = false;

    this.router.navigate([
      '/gestion-hoja-de-vida/hoja-de-vida-pdf/1'
    ]);
  }

  cancelarGeneracionHojaDeVida(): void {
    this.mostrarDialogoConfirmacionGenerarHojaDeVida = false;
  }
}