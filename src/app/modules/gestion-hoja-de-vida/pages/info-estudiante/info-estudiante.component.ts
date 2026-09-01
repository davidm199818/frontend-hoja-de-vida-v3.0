import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Asignatura } from '../../models/Asignatura';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import {
  InformacionService,
  TipoDistincionAcademica
} from '../../services/informacion.service';
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
export class InfoEstudianteComponent implements OnInit, OnDestroy {

  codigoEstudiante = '';
  historia!: HistoriaAcademica;

  activeMenuItem = 'fundamentacion';
  currentTable: string | null = null;

  expandedMenu: { [key: string]: boolean } = {
    investigacion: true,
    complementacion: true
  };

  mostrarDialogoConfirmacionGenerarHojaDeVida = false;
  mostrarFormularioDistincion = false;
  tipoDistincion: TipoDistincionAcademica | '' = '';
  numeroResolucion = '';
  fechaResolucion = '';
  archivoResolucion: File | null = null;
  guardandoDistincion = false;
  mensajeDistincion = '';
  errorDistincion = '';
  readonly fechaMaximaResolucion = this.obtenerFechaLocalActual();
  private inputResolucion: HTMLInputElement | null = null;
  urlResolucion: SafeResourceUrl | null = null;
  tituloResolucion = '';
  cargandoResolucion: TipoDistincionAcademica | null = null;
  private urlObjetoResolucion: string | null = null;

  fundamentacionData: TableRow[] = [];
  electivasData: TableRow[] = [];
  asignaturasVistasData: TableRow[] = [];
  competenciasEmpresarialesData: TableRow[] = [];
  readonly creditosRequeridos = 50;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private infoService: InformacionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.codigoEstudiante = this.route.snapshot.paramMap.get('codigo') ?? '';

    if (!this.codigoEstudiante) {
      this.router.navigate(['/gestion-hoja-de-vida']);
      return;
    }

    this.cargarHistoriaAcademica();
  }

  ngOnDestroy(): void {
    this.liberarUrlResolucion();
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
    this.expandedMenu[menu] = true;
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

  get tienePublicacionesRegistradas(): boolean {
    return this.publicacionesInvestigacion.length > 0;
  }

  get promedioCarrera(): number | null {
    const promedio = this.historia?.estudiante?.promedioCarrera;
    if (promedio === null || promedio === undefined || promedio === '') {
      return null;
    }

    const promedioNumerico = Number(String(promedio).replace(',', '.'));
    return Number.isNaN(promedioNumerico) ? null : promedioNumerico;
  }

  get tieneReconocimientoPromedio(): boolean {
    return this.tieneDistincion('EXCELENCIA_ACADEMICA');
  }

  get esElegibleExcelenciaAcademica(): boolean {
    return (this.promedioCarrera ?? 0) >= 4.8;
  }

  get tieneMencionHonorTrabajoGrado(): boolean {
    return this.tieneDistincion('MENCION_HONOR_TRABAJO_GRADO');
  }

  get tieneTodasLasDistinciones(): boolean {
    return this.tieneReconocimientoPromedio && this.tieneMencionHonorTrabajoGrado;
  }

  seleccionarResolucion(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputResolucion = input;
    this.archivoResolucion = input.files?.item(0) ?? null;
    this.errorDistincion = '';

    if (this.archivoResolucion && this.archivoResolucion.size > 5 * 1024 * 1024) {
      this.errorDistincion = 'La resolución en PDF no puede superar los 5 MB.';
      this.archivoResolucion = null;
      input.value = '';
    }
  }

  registrarDistincion(): void {
    this.mensajeDistincion = '';
    this.errorDistincion = '';

    if (!this.tipoDistincion || !this.numeroResolucion.trim()
      || !this.fechaResolucion || !this.archivoResolucion) {
      this.errorDistincion = 'Completa todos los campos y adjunta la resolución en PDF.';
      return;
    }

    if (this.tieneDistincion(this.tipoDistincion)) {
      this.errorDistincion = 'El estudiante ya tiene registrada esta distinción.';
      return;
    }

    this.guardandoDistincion = true;
    this.infoService.registrarDistincion(
      this.codigoEstudiante,
      this.tipoDistincion,
      this.numeroResolucion,
      this.fechaResolucion,
      this.archivoResolucion
    ).subscribe({
      next: () => {
        this.guardandoDistincion = false;
        this.mensajeDistincion = 'La distinción se registró correctamente.';
        this.limpiarFormularioDistincion();
        this.cargarHistoriaAcademica();
      },
      error: (error) => {
        this.guardandoDistincion = false;
        this.errorDistincion = error?.error?.mensaje
          ?? 'No fue posible registrar la distinción.';
      }
    });
  }

  verResolucion(tipo: TipoDistincionAcademica): void {
    this.errorDistincion = '';
    this.cargandoResolucion = tipo;

    this.infoService.obtenerResolucionDistincion(this.codigoEstudiante, tipo)
      .subscribe({
        next: (resolucion) => {
          this.liberarUrlResolucion();
          this.urlObjetoResolucion = URL.createObjectURL(
            new Blob([resolucion], { type: 'application/pdf' })
          );
          this.urlResolucion = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.urlObjetoResolucion
          );
          this.tituloResolucion = tipo === 'EXCELENCIA_ACADEMICA'
            ? 'Resolución de excelencia académica'
            : 'Resolución de mención de honor por trabajo de grado';
          this.cargandoResolucion = null;
        },
        error: () => {
          this.cargandoResolucion = null;
          this.errorDistincion = 'No fue posible cargar la resolución registrada.';
        }
      });
  }

  cerrarVisorResolucion(): void {
    this.urlResolucion = null;
    this.tituloResolucion = '';
    this.liberarUrlResolucion();
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
    return this.cumplePruebaIdiomaExtranjero ? 'approved' : 'rejected';
  }

  get cumplePruebaIdiomaExtranjero(): boolean {
    return this.estadoPruebaIdiomaExtranjero === 'Aprobada';
  }

  get cumpleRequisitosAcademicos(): boolean {
    return this.tienePublicacionesRegistradas && this.cumplePruebaIdiomaExtranjero;
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

  private tieneDistincion(tipo: TipoDistincionAcademica): boolean {
    const distinciones = this.historia?.historiaAcademica
      ?.informacionAdicional?.distincionesAcademicas ?? [];
    return distinciones.includes(tipo);
  }

  private limpiarFormularioDistincion(): void {
    this.tipoDistincion = '';
    this.numeroResolucion = '';
    this.fechaResolucion = '';
    this.archivoResolucion = null;
    if (this.inputResolucion) {
      this.inputResolucion.value = '';
    }
  }

  private obtenerFechaLocalActual(): string {
    const hoy = new Date();
    const desfase = hoy.getTimezoneOffset() * 60_000;
    return new Date(hoy.getTime() - desfase).toISOString().slice(0, 10);
  }

  private liberarUrlResolucion(): void {
    if (this.urlObjetoResolucion) {
      URL.revokeObjectURL(this.urlObjetoResolucion);
      this.urlObjetoResolucion = null;
    }
  }
}
