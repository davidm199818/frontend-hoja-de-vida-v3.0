import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InformacionService } from '../../services/informacion.service';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import { Asignatura } from '../../models/Asignatura';
import { Publicacion } from '../../models/Publicacion';
import { PasantiaInvestigacion } from '../../models/PasantiaInvestigacion';
import { PracticaDocente } from '../../models/PracticaDocente';
import { AsignaturaHomologada } from '../../models/AsignaturaHomologada';
import {
  openSansRegularBase64,
  openSansBoldBase64
} from '../../../../../assets/fonts/open-sans.js';
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
  posicionesMarcasAgua: number[] = [];

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

      this.programarMarcasAguaVista();
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

  get asignaturasHomologadas(): AsignaturaHomologada[] {
    return this.historia?.historiaAcademica?.informacionAdicional
      ?.asignaturasHomologadas ?? [];
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

      const margen = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = pageWidth - margen * 2;

      this.configurarFuentesInstitucionales(doc);

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
        scrollX: 0,
        scrollY: -window.scrollY
      });

      this.agregarPaginasAlPdf(
        doc,
        content,
        canvas,
        margen,
        usableWidth
      );

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
    margen: number,
    usableWidth: number
  ): void {
    const seccionesProtegidas = this.obtenerSeccionesProtegidas(content, canvas);
    const milimetroEnPuntos = 72 / 25.4;
    const altoPagina = doc.internal.pageSize.getHeight();
    const inicioPrimeraPagina = 62 * milimetroEnPuntos;
    const finUltimaPagina = 234 * milimetroEnPuntos;
    const inicioPaginaNormal = margen;
    const finPaginaNormal = altoPagina - margen;
    const altoPrimeraYUltima = finUltimaPagina - inicioPrimeraPagina;
    const altoPrimeraSinPie = finPaginaNormal - inicioPrimeraPagina;
    const altoUltimaSinEncabezado = finUltimaPagina - inicioPaginaNormal;
    let posicionOrigen = 0;
    let numeroPagina = 0;

    while (posicionOrigen < canvas.height) {
      const alturaRestanteEnPdf = (
        (canvas.height - posicionOrigen) * usableWidth
      ) / canvas.width;
      let inicioContenido = inicioPaginaNormal;
      let alturaDisponible = finPaginaNormal - inicioPaginaNormal;

      if (numeroPagina === 0) {
        inicioContenido = inicioPrimeraPagina;
        if (alturaRestanteEnPdf <= altoPrimeraYUltima) {
          alturaDisponible = altoPrimeraYUltima;
        } else if (alturaRestanteEnPdf <= altoPrimeraSinPie) {
          alturaDisponible = altoPrimeraYUltima;
        } else {
          alturaDisponible = altoPrimeraSinPie;
        }
      } else if (alturaRestanteEnPdf <= altoUltimaSinEncabezado) {
        alturaDisponible = altoUltimaSinEncabezado;
      }

      const maxAlturaFragmento = Math.floor(
        (alturaDisponible * canvas.width) / usableWidth
      );
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

      const esUltimoFragmento = posicionOrigen + alturaFragmento >= canvas.height;
      if (numeroPagina > 0 && esUltimoFragmento && this.esFragmentoVacio(fragmento)) {
        break;
      }

      if (numeroPagina > 0) {
        doc.addPage();
      }

      const alturaEnPdf = (alturaFragmento * usableWidth) / canvas.width;
      doc.addImage(
        fragmento.toDataURL('image/png'),
        'PNG',
        margen,
        inicioContenido,
        usableWidth,
        alturaEnPdf
      );
      this.agregarMarcaAgua(doc);
      this.agregarMembreteInstitucional(
        doc,
        numeroPagina === 0,
        esUltimoFragmento
      );

      posicionOrigen += alturaFragmento;
      numeroPagina++;
    }
  }

  private agregarMarcaAgua(doc: jsPDF): void {
    const centroX = doc.internal.pageSize.getWidth() / 2;
    const centroMarcaX = centroX + 45;
    const centroY = doc.internal.pageSize.getHeight() / 2;

    doc.setGState(doc.GState({ opacity: 0.12 }));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(52);
    doc.setTextColor(62, 76, 101);
    doc.text('DOCUMENTO NO OFICIAL', centroMarcaX, centroY, {
      align: 'center',
      angle: 32
    });

    doc.setGState(doc.GState({ opacity: 1 }));
  }

  private configurarFuentesInstitucionales(doc: jsPDF): void {
    doc.addFileToVFS('OpenSans-Bold.ttf', openSansBoldBase64);
    doc.addFont('OpenSans-Bold.ttf', 'OpenSans', 'bold');
    doc.addFileToVFS('OpenSans-Regular.ttf', openSansRegularBase64);
    doc.addFont('OpenSans-Regular.ttf', 'OpenSans', 'normal');
  }

  private agregarMembreteInstitucional(
    doc: jsPDF,
    mostrarEncabezado: boolean,
    mostrarPie: boolean
  ): void {
    const milimetroEnPuntos = 72 / 25.4;
    const mm = (valor: number): number => valor * milimetroEnPuntos;
    const documento = this.pdfContent?.nativeElement.closest('.document');
    const escudo = documento?.querySelector<HTMLImageElement>('.institutional-shield');
    const acreditacion = documento?.querySelector<HTMLImageElement>('.institutional-accreditation');
    const iso9001 = documento?.querySelector<HTMLImageElement>(
      '.institutional-certifications img:first-child'
    );
    const iqnet = documento?.querySelector<HTMLImageElement>(
      '.institutional-certifications img:last-child'
    );

    if (mostrarEncabezado) {
      if (escudo) {
        doc.addImage(escudo, 'PNG', mm(12), mm(8), mm(32), mm(43.59));
      }

      doc.setDrawColor(0, 18, 130);
      doc.line(mm(44), mm(15), mm(44), mm(42));
      doc.line(mm(103), mm(14), mm(103), mm(42));

      doc.setFont('OpenSans', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 18, 130);
      doc.text('Facultad de', mm(48), mm(23));
      doc.text('Ingeniería Electrónica', mm(48), mm(29));
      doc.text('y Telecomunicaciones', mm(48), mm(35));

      doc.setFont('OpenSans', 'normal');
      doc.text('Maestría en', mm(107), mm(26));
      doc.text('Computación', mm(107), mm(32));
    }

    if (mostrarPie) {
      if (acreditacion) {
        doc.addImage(acreditacion, 'PNG', mm(11), mm(240), mm(49), mm(38.07));
      }
      if (iso9001) {
        doc.addImage(iso9001, 'PNG', mm(170), mm(250), mm(13), mm(17.33));
      }
      if (iqnet) {
        doc.addImage(iqnet, 'PNG', mm(184.5), mm(252), mm(12.5), mm(12.5));
      }

      doc.setFont('OpenSans', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 18, 130);
      doc.text('Carrera 2 No. 3N-100 Segundo Piso, Sector Tulcán', mm(119), mm(253), {
        align: 'center'
      });
      doc.text('Popayán - Cauca - Colombia', mm(119), mm(258), { align: 'center' });
      doc.text('Teléfono (602) 8209800 Exts. 2103 - 2145', mm(119), mm(263), {
        align: 'center'
      });
      doc.setFont('OpenSans', 'bold');
      doc.text(
        'maestriacomputacion@unicauca.edu.co | www.unicauca.edu.co',
        mm(119),
        mm(268),
        { align: 'center' }
      );
    }
  }

  private programarMarcasAguaVista(): void {
    this.cdr.detectChanges();
    requestAnimationFrame(() => this.actualizarMarcasAguaVista());
    setTimeout(() => this.actualizarMarcasAguaVista(), 300);
  }

  private actualizarMarcasAguaVista(): void {
    const content = this.pdfContent?.nativeElement;
    if (!content) {
      return;
    }

    const anchoPaginaPdf = 595.28;
    const altoPaginaPdf = 841.89;
    const margenPdf = 20;
    const anchoUtilPdf = anchoPaginaPdf - margenPdf * 2;
    const altoUtilPdf = altoPaginaPdf - margenPdf * 2;
    const altoPaginaEnVista = (altoUtilPdf * content.scrollWidth) / anchoUtilPdf;
    const cantidadPaginas = Math.max(
      1,
      Math.ceil(content.scrollHeight / altoPaginaEnVista)
    );

    this.posicionesMarcasAgua = Array.from(
      { length: cantidadPaginas },
      (_, indice) => Math.min(
        (indice + 0.5) * altoPaginaEnVista,
        content.scrollHeight - altoPaginaEnVista * 0.2
      )
    );
    this.cdr.detectChanges();
  }

  private esFragmentoVacio(fragmento: HTMLCanvasElement): boolean {
    const contexto = fragmento.getContext('2d');
    if (!contexto) {
      return false;
    }

    const pixeles = contexto.getImageData(
      0,
      0,
      fragmento.width,
      fragmento.height
    ).data;

    for (let posicion = 0; posicion < pixeles.length; posicion += 4) {
      const alfa = pixeles[posicion + 3];
      const esBlanco = pixeles[posicion] >= 250
        && pixeles[posicion + 1] >= 250
        && pixeles[posicion + 2] >= 250;
      if (alfa > 0 && !esBlanco) {
        return false;
      }
    }

    return true;
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
