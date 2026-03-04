import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InformacionService } from '../../services/informacion.service';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import { Asignatura } from '../../models/Asignatura';
import { Publicacion } from '../../models/Publicacion';
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

  fundamentacionData: TableRow[] = [];
  electivasData: TableRow[] = [];
  investigacionData: TableRow[] = [];
  complementacionData: TableRow[] = [];

  constructor(
    private route: ActivatedRoute,
    private infoService: InformacionService
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

  get seccionesMaterias(): TableSection[] {
    return [
      { area: 'Area de Fundamentacion', materias: this.fundamentacionData },
      { area: 'Area de Electivas', materias: this.electivasData },
      { area: 'Area de Investigacion', materias: this.investigacionData },
      { area: 'Area de Complementacion', materias: this.complementacionData }
    ];
  }

  previsualizarPdf(): void {
    window.print();
  }

  async descargarPdf(): Promise<void> {
    if (!this.pdfContent?.nativeElement || this.generandoPdf) {
      return;
    }

    this.generandoPdf = true;

    try {
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

      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * usableWidth) / canvas.width;
      let heightLeft = imgHeight;
      let yPosition = margin;

      doc.addImage(imgData, 'PNG', margin, yPosition, usableWidth, imgHeight);
      heightLeft -= usableHeight;

      while (heightLeft > 0) {
        doc.addPage();
        yPosition = margin - (imgHeight - heightLeft);
        doc.addImage(imgData, 'PNG', margin, yPosition, usableWidth, imgHeight);
        heightLeft -= usableHeight;
      }

      doc.save(`hoja-de-vida-${this.codigoEstudiante || 'estudiante'}.pdf`);
    } finally {
      this.generandoPdf = false;
    }
  }
}
