import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InformacionService } from '../../services/informacion.service';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import { Asignatura } from '../../models/Asignatura';
import { Publicacion } from '../../models/Publicacion';
import { PasantiaInvestigacion } from '../../models/PasantiaInvestigacion';
import { PracticaDocente } from '../../models/PracticaDocente';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TableRow {
  periodo: string;
  codigo: string;
  nombre: string;
  creditos: number;
  nota: string;
}

interface TableSection {
  area: string;
  materias: TableRow[];
}

@Component({
  selector: 'app-hoja-de-vida-pdf',
  templateUrl: './hoja-de-vida-pdf.component.html',
  styleUrls: ['./hoja-de-vida-pdf.component.scss']
})
export class HojaDeVidaPdfComponent implements OnInit {
  @ViewChild('pdfContent') pdfContent?: ElementRef<HTMLElement>;

  codigoEstudiante = '';
  historia!: HistoriaAcademica;
  generandoPdf = false;
  fechaHoraGeneracion = '';

  fundamentacionData: TableRow[] = [];
  electivasData: TableRow[] = [];
  investigacionData: TableRow[] = [];
  complementacionData: TableRow[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private infoService: InformacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.codigoEstudiante = this.route.snapshot.paramMap.get('codigo') ?? '';
    if (this.codigoEstudiante) {
      this.cargarHistoriaAcademica();
    }
  }

  cargarHistoriaAcademica(): void {
    this.infoService.getHistoriaAcademica(this.codigoEstudiante).subscribe(data => {
      this.historia = data;
      const h = data.historiaAcademica;

      this.fundamentacionData = this.mapAsignaturas(h.fundamentacion.asignaturas);
      this.electivasData = this.mapAsignaturas(h.electivas.asignaturas);
      this.investigacionData = this.mapAsignaturas(h.investigacion.asignaturas);
      this.complementacionData =
        this.mapAsignaturas(h.complementacion.competenciasEmpresariales.asignaturas);
    });
  }

  private mapAsignaturas(asignaturas: Asignatura[]): TableRow[] {
    return asignaturas.map(a => ({
      periodo: a.periodoCursado,
      codigo: a.codigoMateria,
      nombre: a.nombreMateria,
      creditos: a.creditos,
      nota: a.notaDefinitiva?.toString() ?? 'NR'
    }));
  }

  get estudiante() {
    return this.historia?.historiaAcademica?.informacionAdicional;
  }

  get tituloTesis(): string {
    return this.estudiante?.tituloTesis || 'Sin registrar';
  }
  get directorTesis(): string {
    return this.estudiante?.directorTesis || 'Sin registrar';
  }
  get codirectorTesis(): string {
    return this.estudiante?.codirectorTesis || 'Sin registrar';
  }
  get publicacionesInvestigacion(): Publicacion[] {
    return this.historia?.historiaAcademica?.investigacion?.publicaciones ?? [];
  }

  get pasantiasInvestigacion(): PasantiaInvestigacion[] {
    return this.historia?.historiaAcademica?.investigacion?.pasantias ?? [];
  }

  get practicasDocentes(): PracticaDocente[] {
    return this.historia?.historiaAcademica?.complementacion?.practicasDocentes ?? [];
  }

  get estadoMaestriaLabel(): string {
    switch (this.historia?.estudiante?.estadoMaestria) {
      case 'ACTIVO':
        return 'Estudiante activo de la Maestría en Computación - Universidad del Cauca';
      case 'MAESTRIA_FINALIZADA':
        return 'Egresado de la Maestría en Computación';
      case 'RETIRADO':
        return 'Retirado';
      case 'EN_SUSPENCION':
        return 'En suspensión';
      default:
        return 'Sin registrar';
    }
  }

  get modalidadAcademicaLabel(): string {
    const modalidad = this.historia?.estudiante?.modalidadAcademica;

    if (modalidad === 'INVESTIGACION') {
      return 'Investigación';
    }
    if (modalidad === 'PROFUNDIZACION') {
      return 'Profundización';
    }
    return 'Sin registrar';
  }

  get grupoInvestigacionLabel(): string {
    const grupo = this.historia?.estudiante?.grupoInvestigacion;
    const nombre = grupo?.nombre?.trim();
    const sigla = grupo?.sigla?.trim();

    if (nombre && sigla) {
      return `${nombre} (${sigla})`;
    }
    return nombre || sigla || 'Sin registrar';
  }

  get tieneReconocimientoPromedio(): boolean {
    return this.tieneDistincion('EXCELENCIA_ACADEMICA');
  }

  get tieneMencionHonorTrabajoGrado(): boolean {
    return this.tieneDistincion('MENCION_HONOR_TRABAJO_GRADO');
  }

  get tieneDistincionesAcademicas(): boolean {
    return this.tieneReconocimientoPromedio || this.tieneMencionHonorTrabajoGrado;
  }

  get seccionesMaterias(): TableSection[] {
    return [
      { area: 'Area de Fundamentacion', materias: this.fundamentacionData },
      { area: 'Area de Electivas', materias: this.electivasData },
      { area: 'Area de Investigacion', materias: this.investigacionData },
      { area: 'Area de Complementacion', materias: this.complementacionData }
    ];
  }

  private tieneDistincion(tipo: string): boolean {
    const distinciones = this.historia?.historiaAcademica
      ?.informacionAdicional?.distincionesAcademicas ?? [];
    return distinciones.includes(tipo);
  }

  volver(): void {
    this.router.navigate([
      '/gestion-hoja-de-vida/info-estudiante',
      this.codigoEstudiante
    ]);
  }

  async descargarPdf(): Promise<void> {
    if (!this.pdfContent?.nativeElement || this.generandoPdf) {
      return;
    }

    this.generandoPdf = true;

    try {
      this.fechaHoraGeneracion = this.obtenerFechaHoraGeneracion();
      this.cdr.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const content = this.pdfContent.nativeElement;
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
        scrollX: 0,
        scrollY: -window.scrollY
      });

      this.agregarPaginasAlPdf(doc, content, canvas, margin, usableWidth, usableHeight);

      doc.save(`hoja-de-vida-${this.codigoEstudiante || 'estudiante'}.pdf`);
    } finally {
      this.generandoPdf = false;
    }
  }

  private obtenerFechaHoraGeneracion(): string {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date());
  }

  private agregarPaginasAlPdf(
    doc: jsPDF,
    content: HTMLElement,
    canvas: HTMLCanvasElement,
    margin: number,
    usableWidth: number,
    usableHeight: number
  ): void {
    const maxAlturaFragmento = Math.floor((usableHeight * canvas.width) / usableWidth);
    const seccionesProtegidas = this.obtenerSeccionesProtegidas(content, canvas);
    let posicionOrigen = 0;
    let numeroPagina = 0;

    while (posicionOrigen < canvas.height) {
      const limitePagina = Math.min(posicionOrigen + maxAlturaFragmento, canvas.height);
      const seccionQueNoCabe = seccionesProtegidas.find(
        seccion => seccion.inicio > posicionOrigen + 10
          && seccion.inicio < limitePagina
          && seccion.fin > limitePagina
          && seccion.fin - seccion.inicio <= maxAlturaFragmento
      );
      const alturaFragmento = seccionQueNoCabe
        ? seccionQueNoCabe.inicio - posicionOrigen
        : limitePagina - posicionOrigen;

      if (numeroPagina > 0) {
        doc.addPage();
      }

      const fragmento = document.createElement('canvas');
      fragmento.width = canvas.width;
      fragmento.height = alturaFragmento;
      fragmento.getContext('2d')?.drawImage(
        canvas,
        0,
        posicionOrigen,
        canvas.width,
        alturaFragmento,
        0,
        0,
        canvas.width,
        alturaFragmento
      );

      const alturaEnPdf = (alturaFragmento * usableWidth) / canvas.width;
      doc.addImage(fragmento.toDataURL('image/png'), 'PNG', margin, margin, usableWidth, alturaEnPdf);

      posicionOrigen += alturaFragmento;
      numeroPagina++;
    }
  }

  private obtenerSeccionesProtegidas(
    content: HTMLElement,
    canvas: HTMLCanvasElement
  ): Array<{ inicio: number; fin: number }> {
    const rectanguloContenido = content.getBoundingClientRect();
    const escalaCanvas = canvas.height / rectanguloContenido.height;

    return Array.from(content.querySelectorAll<HTMLElement>('.pdf-avoid-break'))
      .map(elemento => {
        const rectanguloElemento = elemento.getBoundingClientRect();
        return {
          inicio: Math.round((rectanguloElemento.top - rectanguloContenido.top) * escalaCanvas),
          fin: Math.round((rectanguloElemento.bottom - rectanguloContenido.top) * escalaCanvas)
        };
      })
      .filter(seccion => seccion.inicio > 0 && seccion.fin <= canvas.height)
      .sort((primera, segunda) => primera.inicio - segunda.inicio);
  }
}
