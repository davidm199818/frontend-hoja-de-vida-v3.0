import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InformacionService } from '../../services/informacion.service';
import { HistoriaAcademica } from '../../models/Historia-Academica';
import { Asignatura } from '../../models/Asignatura';
import { Publicacion } from '../../models/Publicacion';
import jsPDF from 'jspdf';

interface TableRow {
  periodo: string;
  codigo: string;
  nombre: string;
  creditos: number;
  nota: string;
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

  previsualizarPdf(): void {
    window.print();
  }

  async descargarPdf(): Promise<void> {
    if (!this.pdfContent?.nativeElement || this.generandoPdf) {
      return;
    }

    this.generandoPdf = true;

    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      await new Promise<void>((resolve) => {
        doc.html(this.pdfContent!.nativeElement, {
          margin: [20, 20, 20, 20],
          autoPaging: 'text',
          html2canvas: {
            scale: 0.6,
            useCORS: true
          },
          callback: (pdf) => {
            pdf.save(`hoja-de-vida-${this.codigoEstudiante || 'estudiante'}.pdf`);
            resolve();
          }
        });
      });
    } finally {
      this.generandoPdf = false;
    }
  }
}
