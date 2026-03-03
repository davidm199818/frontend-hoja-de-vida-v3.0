import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Asignatura } from '../../models/Asignatura';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import { InformacionService } from '../../services/informacion.service';
import { Publicacion } from '../../models/Publicacion';
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

  codigoEstudiante = '';
  historia!: HistoriaAcademica;

  activeMenuItem = 'fundamentacion';
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
  readonly creditosRequeridos = 50;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private infoService: InformacionService
  ) {}

  ngOnInit(): void {
    this.codigoEstudiante = this.route.snapshot.paramMap.get('codigo') ?? '';

    if (!this.codigoEstudiante) {
      this.router.navigate(['/gestion-hoja-de-vida']);
      return;
    }

    this.cargarHistoriaAcademica();
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  cargarHistoriaAcademica(): void {
    this.infoService.getHistoriaAcademica(this.codigoEstudiante).subscribe(data => {
      this.historia = data;
      const historiaAcademica = data.historiaAcademica;

      this.fundamentacionData = this.mapAsignaturas(historiaAcademica.fundamentacion.asignaturas);
      this.electivasData = this.mapAsignaturas(historiaAcademica.electivas.asignaturas);
      this.asignaturasVistasData = this.mapAsignaturas(historiaAcademica.investigacion.asignaturas);
      this.competenciasEmpresarialesData =
        this.mapAsignaturas(historiaAcademica.complementacion.competenciasEmpresariales.asignaturas);
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
    return asignaturas.map((a) => ({
      periodo: a.periodoCursado,
      codigo: a.codigoMateria,
      nombre: a.nombreMateria,
      creditos: a.creditos,
      nota: a.notaDefinitiva?.toString() ?? 'NR'
    }));
  }

  mostrarConfirmacionGenerarHojaDeVida(): void {
    this.mostrarDialogoConfirmacionGenerarHojaDeVida = false;
    this.router.navigate([
      '/gestion-hoja-de-vida/hoja-de-vida-pdf',
      this.codigoEstudiante
    ]);
  }

  confirmarGeneracionHojaDeVida(): void {
    this.mostrarDialogoConfirmacionGenerarHojaDeVida = false;
    this.router.navigate([
      '/gestion-hoja-de-vida/hoja-de-vida-pdf',
      this.codigoEstudiante
    ]);
  }

  cancelarGeneracionHojaDeVida(): void {
    this.mostrarDialogoConfirmacionGenerarHojaDeVida = false;
  }

  get creditosCumplidos(): number {
    return this.historia?.historiaAcademica?.informacionAdicional?.creditosCumplidos ?? 0;
  }

  get tituloTesis(): string {
    const titulo = this.historia?.historiaAcademica?.informacionAdicional?.tituloTesis;
    return titulo && titulo.trim().length > 0 ? titulo : 'Sin registrar';
  }

  get progresoCreditos(): number {
    if (this.creditosRequeridos <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.creditosCumplidos / this.creditosRequeridos) * 100));
  }
  get publicacionesInvestigacion(): Publicacion[] {
    return this.historia?.historiaAcademica?.investigacion?.publicaciones ?? [];
  }

  get directorTesis(): string {
    const director = this.historia?.historiaAcademica?.informacionAdicional?.directorTesis;
    return director && director.trim().length > 0 ? director : 'Sin registrar';
  }

  get codirectorTesis(): string {
    const codirector = this.historia?.historiaAcademica?.informacionAdicional?.codirectorTesis;
    return codirector && codirector.trim().length > 0 ? codirector : 'Sin registrar';
  }

  get estadoPruebaIdiomaExtranjero(): 'Aprobada' | 'No aprobada' | 'Sin registrar' {
    const asignaturas = this.historia?.historiaAcademica?.informacionAdicional?.asignaturas ?? [];
    const pruebaIdioma = asignaturas.find((a) => this.esPruebaIdioma(a));

    if (!pruebaIdioma) {
      return 'Sin registrar';
    }

    const nota = (pruebaIdioma.notaDefinitiva ?? '').trim().toUpperCase();

    if (!nota || nota === 'NR') {
      return 'Sin registrar';
    }

    if (nota === 'A') {
      return 'Aprobada';
    }

    if (nota === 'NA') {
      return 'No aprobada';
    }

    const notaNumerica = Number(nota.replace(',', '.'));
    if (!Number.isNaN(notaNumerica)) {
      return notaNumerica >= 3 ? 'Aprobada' : 'No aprobada';
    }

    return 'Sin registrar';
  }

  get claseEstadoPruebaIdiomaExtranjero(): string {
    const estado = this.estadoPruebaIdiomaExtranjero;
    if (estado === 'Aprobada') {
      return 'approved';
    }
    if (estado === 'No aprobada') {
      return 'pending';
    }
    return 'not-recorded';
  }

  private esPruebaIdioma(asignatura: Asignatura): boolean {
    const codigo = (asignatura.codigoMateria ?? '').toUpperCase();
    const nombre = (asignatura.nombreMateria ?? '').toUpperCase();

    return (
      codigo.includes('PSI')
      || nombre.includes('IDIOMA')
      || nombre.includes('SUFICIENCIA')
      || nombre.includes('EXTRANJER')
    );
  }
}
