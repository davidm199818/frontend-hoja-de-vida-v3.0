import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Asignatura } from '../../models/Asignatura';
import { HistoriaAcademica, HistoriaAcademicaData } from '../../models/Historia-Academica';
import {
  InformacionService,
  TipoDistincionAcademica
} from '../../services/informacion.service';
import { Publicacion } from '../../models/Publicacion';
import { AutenticacionService } from '../../../gestion-autenticacion/services/autenticacion.service';
interface TableRow {
  periodo: string;
  codigo: string;
  nombre: string;
  creditos: number;
  nota: string;
}

interface AcademicPeriodGroup {
  periodo: string;
  asignaturas: TableRow[];
  totalCreditos: number;
}

@Component({
  selector: 'app-info-estudiante',
  templateUrl: './info-estudiante.component.html',
  styleUrls: ['./info-estudiante.component.scss']
})
export class InfoEstudianteComponent implements OnInit, OnDestroy {
  private readonly usarDatosTemporalesVisualizacion = true;

  codigoEstudiante = '';
  historia!: HistoriaAcademica;

  activeMenuItem = 'fundamentacion';
  historyViewMode: 'areas' | 'consolidated' = 'areas';
  currentTable: string | null = null;

  expandedMenu: { [key: string]: boolean } = {
    investigacion: false,
    complementacion: false
  };

  mostrarDialogoConfirmacionGenerarHojaDeVida = false;
  mostrarFormularioDistincion = false;
  tipoDistincion: TipoDistincionAcademica | '' = '';
  numeroResolucion = '';
  fechaResolucion = '';
  archivoResolucion: File | null = null;
  guardandoDistincion = false;
  tipoDistincionEdicion: TipoDistincionAcademica | null = null;
  numeroResolucionEdicion = '';
  fechaResolucionEdicion = '';
  archivoResolucionEdicion: File | null = null;
  cargandoDetalleDistincion: TipoDistincionAcademica | null = null;
  actualizandoDistincion = false;
  tipoDistincionEliminacion: TipoDistincionAcademica | null = null;
  eliminandoDistincion = false;
  mensajeDistincion = '';
  errorDistincion = '';
  readonly fechaMaximaResolucion = this.obtenerFechaLocalActual();
  private inputResolucion: HTMLInputElement | null = null;
  private inputResolucionEdicion: HTMLInputElement | null = null;
  urlResolucion: SafeResourceUrl | null = null;
  tituloResolucion = '';
  nombreArchivoResolucion = '';
  cargandoResolucion: TipoDistincionAcademica | null = null;
  urlDescargaResolucion: string | null = null;
  private archivoResolucionVisualizado: Blob | null = null;

  fundamentacionData: TableRow[] = [];
  electivasData: TableRow[] = [];
  asignaturasVistasData: TableRow[] = [];
  competenciasEmpresarialesData: TableRow[] = [];
  historiaConsolidadaData: TableRow[] = [];
  historiaConsolidadaPorPeriodo: AcademicPeriodGroup[] = [];
  readonly creditosRequeridos = 50;
  readonly horasPracticaDocenteRequeridas = 96;
  readonly totalRequisitosAcademicos = 4;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private infoService: InformacionService,
    private sanitizer: DomSanitizer,
    private autenticacion: AutenticacionService
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
    this.router.navigate(
      this.esCoordinador ? ['/gestion-hoja-de-vida'] : ['/']
    );
  }

  get esCoordinador(): boolean {
    return this.autenticacion.hasRole('ROLE_COORDINADOR');
  }

  get modalidadAcademicaLabel(): string {
    const modalidad = this.historia?.estudiante.modalidadAcademica;

    if (modalidad === 'INVESTIGACION') {
      return 'Investigación';
    }
    if (modalidad === 'PROFUNDIZACION') {
      return 'Profundización';
    }
    return 'Sin registrar';
  }

  get estadoMaestriaLabel(): string {
    const estado = this.historia?.estudiante.estadoMaestria;

    switch (estado) {
      case 'ACTIVO':
        return 'Cursando';
      case 'MAESTRIA_FINALIZADA':
        return 'Egresado';
      case 'RETIRADO':
        return 'Retirado';
      case 'EN_SUSPENCION':
        return 'En suspensión';
      default:
        return 'Sin registrar';
    }
  }

  cargarHistoriaAcademica(): void {
    this.infoService.getHistoriaAcademica(this.codigoEstudiante).subscribe(data => {
      this.historia = data;
      const historiaAcademica = data.historiaAcademica;

      if (
        this.usarDatosTemporalesVisualizacion
        && data.estudiante.codigoEstudiante === 'IS20260157'
      ) {
        this.aplicarDatosTemporalesVisualizacion(historiaAcademica);
      }

      this.fundamentacionData = this.mapAsignaturas(historiaAcademica.fundamentacion.asignaturas);
      this.electivasData = this.mapAsignaturas(historiaAcademica.electivas.asignaturas);
      this.asignaturasVistasData = this.mapAsignaturas(historiaAcademica.investigacion.asignaturas);
      this.competenciasEmpresarialesData =
        this.mapAsignaturas(historiaAcademica.complementacion.competenciasEmpresariales.asignaturas);
      this.historiaConsolidadaData = this.construirHistoriaConsolidada();
      this.historiaConsolidadaPorPeriodo = this.agruparHistoriaPorPeriodo();
    });
  }

  private aplicarDatosTemporalesVisualizacion(historiaAcademica: HistoriaAcademicaData): void {
    historiaAcademica.investigacion.publicaciones = [
      {
        codigoPublicacion: '10.0000/demo-hv-001',
        creditosAsignados: 3,
        acta: 'ACTA-DEMO-001',
        nombrePublicacion: 'Aplicación de inteligencia artificial en procesos educativos',
        tipoPublicacion: 'Artículo de investigación',
        nombreRevista: 'Revista Colombiana de Computación',
        categoriaIndexada: 'A1',
        urlPublicacion: 'https://doi.org/10.0000/demo-hv-001',
        fechaAceptacion: '2025-03-15'
      },
      {
        codigoPublicacion: '10.0000/demo-hv-002',
        creditosAsignados: 2,
        acta: 'ACTA-DEMO-002',
        nombrePublicacion: 'Arquitecturas de software para sistemas académicos distribuidos',
        tipoPublicacion: 'Artículo de reflexión',
        nombreRevista: 'Ingeniería e Innovación',
        categoriaIndexada: 'B',
        urlPublicacion: 'https://doi.org/10.0000/demo-hv-002',
        fechaAceptacion: '2025-08-20'
      }
    ];

    historiaAcademica.complementacion.practicasDocentes = [
      {
        creditosAsignados: 1,
        acta: 'ACTA-PD-DEMO-001',
        fechaActa: '2025-05-30',
        horas: 48,
        actividades: [{
          tipoActividad: 'Docencia',
          nombreActividad: 'Docencia en pregrado'
        }]
      },
      {
        creditosAsignados: 1,
        acta: 'ACTA-PD-DEMO-002',
        fechaActa: '2025-11-28',
        horas: 24,
        actividades: [{
          tipoActividad: 'Apoyo docente',
          nombreActividad: 'Elaboración de material de apoyo'
        }]
      },
      {
        creditosAsignados: 1,
        acta: 'ACTA-PD-DEMO-003',
        fechaActa: '2026-04-24',
        horas: 24,
        actividades: [{
          tipoActividad: 'Evaluación académica',
          nombreActividad: 'Evaluación de anteproyecto de pregrado'
        }]
      }
    ];
  }

  toggleSubmenu(menu: 'investigacion' | 'complementacion'): void {
    this.expandedMenu[menu] = !this.expandedMenu[menu];
  }

  selectMenuItem(item: string): void {
    this.activeMenuItem = item;
    this.currentTable = item;
  }

  selectHistoryView(mode: 'areas' | 'consolidated'): void {
    this.historyViewMode = mode;
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

  private construirHistoriaConsolidada(): TableRow[] {
    return [
      ...this.fundamentacionData,
      ...this.electivasData,
      ...this.asignaturasVistasData,
      ...this.competenciasEmpresarialesData
    ].sort((first, second) =>
      first.periodo.localeCompare(second.periodo, 'es', { numeric: true })
      || first.codigo.localeCompare(second.codigo, 'es', { numeric: true })
    );
  }

  private agruparHistoriaPorPeriodo(): AcademicPeriodGroup[] {
    const grupos = new Map<string, TableRow[]>();

    this.historiaConsolidadaData.forEach(asignatura => {
      const asignaturasPeriodo = grupos.get(asignatura.periodo) ?? [];
      asignaturasPeriodo.push(asignatura);
      grupos.set(asignatura.periodo, asignaturasPeriodo);
    });

    return Array.from(grupos, ([periodo, asignaturas]) => ({
      periodo,
      asignaturas,
      totalCreditos: asignaturas.reduce((total, asignatura) => total + asignatura.creditos, 0)
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

  get creditosPendientes(): number {
    return Math.max(0, this.creditosRequeridos - this.creditosCumplidos);
  }

  get cumpleCreditosAcademicos(): boolean {
    return this.creditosCumplidos >= this.creditosRequeridos;
  }

  get horasPracticaDocenteCumplidas(): number {
    const practicas = this.historia?.historiaAcademica?.complementacion?.practicasDocentes ?? [];

    return practicas.reduce((total, practica) => {
      const horas = Number(practica.horas) || 0;
      return total + Math.max(0, horas);
    }, 0);
  }

  get progresoPracticaDocente(): number {
    return Math.min(
      100,
      Math.round((this.horasPracticaDocenteCumplidas / this.horasPracticaDocenteRequeridas) * 100)
    );
  }

  get horasPracticaDocentePendientes(): number {
    return Math.max(
      0,
      this.horasPracticaDocenteRequeridas - this.horasPracticaDocenteCumplidas
    );
  }

  get cumplePracticaDocente(): boolean {
    return this.horasPracticaDocenteCumplidas >= this.horasPracticaDocenteRequeridas;
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
    this.archivoResolucion = this.obtenerArchivoPdf(input);
  }

  seleccionarResolucionEdicion(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputResolucionEdicion = input;
    this.archivoResolucionEdicion = this.obtenerArchivoPdf(input);
  }

  alternarFormularioRegistro(): void {
    this.mostrarFormularioDistincion = !this.mostrarFormularioDistincion;
    this.mensajeDistincion = '';
    this.errorDistincion = '';
    if (this.mostrarFormularioDistincion) {
      this.limpiarFormularioEdicion();
    } else {
      this.limpiarFormularioDistincion();
    }
  }

  registrarDistincion(): void {
    this.mensajeDistincion = '';
    this.errorDistincion = '';

    if (!this.esCoordinador) {
      this.errorDistincion = 'No tiene permisos para registrar distinciones.';
      return;
    }

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

  abrirFormularioEdicion(tipo: TipoDistincionAcademica): void {
    if (!this.esCoordinador) {
      this.errorDistincion = 'No tiene permisos para editar distinciones.';
      return;
    }

    if (this.cargandoDetalleDistincion) {
      return;
    }

    this.mostrarFormularioDistincion = false;
    this.limpiarFormularioDistincion();
    this.limpiarFormularioEdicion();
    this.mensajeDistincion = '';
    this.errorDistincion = '';
    this.cargandoDetalleDistincion = tipo;

    this.infoService.obtenerDetalleDistincion(this.codigoEstudiante, tipo).subscribe({
      next: (detalle) => {
        this.cargandoDetalleDistincion = null;
        this.tipoDistincionEdicion = detalle.tipo;
        this.numeroResolucionEdicion = detalle.numeroResolucion;
        this.fechaResolucionEdicion = detalle.fechaResolucion;
      },
      error: (error) => {
        this.cargandoDetalleDistincion = null;
        this.errorDistincion = error?.error?.mensaje
          ?? 'No fue posible consultar los datos de la distinción.';
      }
    });
  }

  cancelarEdicionDistincion(): void {
    this.limpiarFormularioEdicion();
    this.errorDistincion = '';
  }

  editarDistincion(): void {
    this.mensajeDistincion = '';
    this.errorDistincion = '';

    if (!this.esCoordinador) {
      this.errorDistincion = 'No tiene permisos para editar distinciones.';
      return;
    }

    if (!this.tipoDistincionEdicion
      || !this.numeroResolucionEdicion.trim()
      || !this.fechaResolucionEdicion) {
      this.errorDistincion = 'Completa el número y la fecha de la resolución.';
      return;
    }

    this.actualizandoDistincion = true;
    this.infoService.editarDistincion(
      this.codigoEstudiante,
      this.tipoDistincionEdicion,
      this.numeroResolucionEdicion,
      this.fechaResolucionEdicion,
      this.archivoResolucionEdicion
    ).subscribe({
      next: () => {
        this.actualizandoDistincion = false;
        this.mensajeDistincion = 'La distinción se actualizó correctamente.';
        this.limpiarFormularioEdicion();
        this.cargarHistoriaAcademica();
      },
      error: (error) => {
        this.actualizandoDistincion = false;
        this.errorDistincion = error?.error?.mensaje
          ?? 'No fue posible actualizar la distinción.';
      }
    });
  }

  solicitarEliminarDistincion(tipo: TipoDistincionAcademica): void {
    if (!this.esCoordinador) {
      this.errorDistincion = 'No tiene permisos para eliminar distinciones.';
      return;
    }

    this.tipoDistincionEliminacion = tipo;
    this.mensajeDistincion = '';
    this.errorDistincion = '';
  }

  cancelarEliminacionDistincion(): void {
    if (!this.eliminandoDistincion) {
      this.tipoDistincionEliminacion = null;
    }
  }

  confirmarEliminacionDistincion(): void {
    if (!this.tipoDistincionEliminacion || this.eliminandoDistincion) {
      return;
    }

    const tipo = this.tipoDistincionEliminacion;
    this.eliminandoDistincion = true;
    this.infoService.eliminarDistincion(this.codigoEstudiante, tipo).subscribe({
      next: () => {
        this.eliminandoDistincion = false;
        this.tipoDistincionEliminacion = null;
        this.mensajeDistincion = 'La distinción se eliminó correctamente.';
        this.limpiarFormularioEdicion();
        this.cerrarVisorResolucion();
        this.cargarHistoriaAcademica();
      },
      error: (error) => {
        this.eliminandoDistincion = false;
        this.tipoDistincionEliminacion = null;
        this.errorDistincion = error?.error?.mensaje
          ?? 'No fue posible eliminar la distinción.';
      }
    });
  }

  nombreTipoDistincion(tipo: TipoDistincionAcademica): string {
    return tipo === 'EXCELENCIA_ACADEMICA'
      ? 'Excelencia académica'
      : 'Mención de honor por trabajo de grado';
  }

  verResolucion(tipo: TipoDistincionAcademica): void {
    this.errorDistincion = '';
    this.cargandoResolucion = tipo;

    this.infoService.obtenerResolucionDistincion(this.codigoEstudiante, tipo)
      .subscribe({
        next: (respuesta) => {
          const resolucion = respuesta.body;
          if (!resolucion) {
            this.cargandoResolucion = null;
            this.errorDistincion = 'La resolución registrada no contiene un PDF.';
            return;
          }

          this.liberarUrlResolucion();
          this.archivoResolucionVisualizado = resolucion;
          this.urlDescargaResolucion = URL.createObjectURL(resolucion);
          this.urlResolucion = this.sanitizer.bypassSecurityTrustResourceUrl(
            `${this.urlDescargaResolucion}#toolbar=0&navpanes=0`
          );
          this.nombreArchivoResolucion = this.extraerNombreArchivo(
            respuesta.headers.get('Content-Disposition')
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

  descargarResolucionActual(): void {
    if (!this.archivoResolucionVisualizado || !this.nombreArchivoResolucion) {
      this.errorDistincion = 'No hay una resolución disponible para descargar.';
      return;
    }

    const urlDescarga = URL.createObjectURL(this.archivoResolucionVisualizado);
    const enlace = document.createElement('a');
    enlace.href = urlDescarga;
    enlace.download = this.nombreArchivoResolucion;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.setTimeout(() => URL.revokeObjectURL(urlDescarga), 1000);
  }

  cerrarVisorResolucion(): void {
    this.urlResolucion = null;
    this.tituloResolucion = '';
    this.nombreArchivoResolucion = '';
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
    return this.cantidadRequisitosCumplidos === this.totalRequisitosAcademicos;
  }

  get cantidadRequisitosCumplidos(): number {
    return [
      this.cumpleCreditosAcademicos,
      this.cumplePracticaDocente,
      this.tienePublicacionesRegistradas,
      this.cumplePruebaIdiomaExtranjero
    ].filter(Boolean).length;
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

  private limpiarFormularioEdicion(): void {
    this.tipoDistincionEdicion = null;
    this.numeroResolucionEdicion = '';
    this.fechaResolucionEdicion = '';
    this.archivoResolucionEdicion = null;
    if (this.inputResolucionEdicion) {
      this.inputResolucionEdicion.value = '';
    }
  }

  private obtenerArchivoPdf(input: HTMLInputElement): File | null {
    const archivo = input.files?.item(0) ?? null;
    this.errorDistincion = '';

    if (!archivo) {
      return null;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      this.errorDistincion = 'La resolución en PDF no puede superar los 5 MB.';
      input.value = '';
      return null;
    }

    const esPdf = archivo.type === 'application/pdf'
      || archivo.name.toLowerCase().endsWith('.pdf');
    if (!esPdf) {
      this.errorDistincion = 'El archivo de resolución debe ser un PDF.';
      input.value = '';
      return null;
    }
    return archivo;
  }

  private obtenerFechaLocalActual(): string {
    const hoy = new Date();
    const desfase = hoy.getTimezoneOffset() * 60_000;
    return new Date(hoy.getTime() - desfase).toISOString().slice(0, 10);
  }

  private liberarUrlResolucion(): void {
    if (this.urlDescargaResolucion) {
      URL.revokeObjectURL(this.urlDescargaResolucion);
      this.urlDescargaResolucion = null;
    }
    this.archivoResolucionVisualizado = null;
  }

  private extraerNombreArchivo(contentDisposition: string | null): string {
    const coincidencia = contentDisposition?.match(/filename="([^"]+)"/i);
    return coincidencia?.[1] ?? 'resolucion.pdf';
  }
}
