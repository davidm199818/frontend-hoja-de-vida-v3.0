import { TipoIdentificacion } from './../../../../core/enums/domain-enum';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HojaDeVidaService } from '../../services/hoja-de-vida.service';
import { Estudiante } from '../../models/Estudiantehv';

@Component({
    selector: 'app-buscar-estudiante',
    templateUrl: './buscar-estudiante.component.html',
    styleUrls: ['./buscar-estudiante.component.scss']
})
export class BuscarEstudianteComponent implements OnInit {

    criterio = '';
    suficienciaIdiomaAprobada: boolean | null = null;
    semestreActual: number | null = null;
    estudiantes: Estudiante[] = [];
    cargando = false;
    error = '';
    page = 0;
    size = 10;
    readonly semestresDisponibles = [1, 2, 3, 4];
    private solicitudListadoActual = 0;


    constructor(
        private router: Router,
        private hojaDeVidaService: HojaDeVidaService
    ) { }

    ngOnInit(): void {
        this.cargarEstudiantes();
    }

    buscar(): void {
        const criterio = this.criterio.trim();
        if (!criterio) {
            return;
        }

        this.suficienciaIdiomaAprobada = null;
        this.semestreActual = null;
        this.page = 0;
        this.cargando = true;
        this.error = '';
        this.estudiantes = [];
        const solicitudId = ++this.solicitudListadoActual;

        this.hojaDeVidaService.buscar(criterio).subscribe({
            next: (data) => {
                if (solicitudId !== this.solicitudListadoActual) {
                    return;
                }
                this.estudiantes = data;
                this.cargando = false;
            },
            error: () => {
                if (solicitudId !== this.solicitudListadoActual) {
                    return;
                }
                this.error = 'Error al buscar estudiantes';
                this.cargando = false;
            }
        });
    }

    cargarEstudiantes(): void {
        this.page = 0;
        this.cargando = true;
        this.error = '';
        const solicitudId = ++this.solicitudListadoActual;

        this.hojaDeVidaService.listarEstudiantes().subscribe({
            next: (data) => {
                if (solicitudId !== this.solicitudListadoActual) {
                    return;
                }
                this.estudiantes = data;
                this.cargando = false;
            },
            error: () => {
                if (solicitudId !== this.solicitudListadoActual) {
                    return;
                }
                this.error = 'Error al cargar los estudiantes';
                this.cargando = false;
            }
        });
    }

    seleccionarSuficiencia(valor: boolean | null): void {
        this.suficienciaIdiomaAprobada = valor;
        this.aplicarFiltros();
    }

    seleccionarSemestre(valor: number | null): void {
        this.semestreActual = valor;
        this.aplicarFiltros();
    }

    aplicarFiltros(): void {
        if (this.semestreInvalido) {
            return;
        }

        this.criterio = '';

        if (this.cantidadFiltrosActivos === 0) {
            this.cargarEstudiantes();
            return;
        }

        this.page = 0;
        this.cargando = true;
        this.error = '';
        this.estudiantes = [];
        const solicitudId = ++this.solicitudListadoActual;

        this.hojaDeVidaService
            .filtrar(this.suficienciaIdiomaAprobada, this.semestreActual)
            .subscribe({
                next: (data) => {
                    if (solicitudId !== this.solicitudListadoActual) {
                        return;
                    }
                    this.estudiantes = data;
                    this.cargando = false;
                },
                error: () => {
                    if (solicitudId !== this.solicitudListadoActual) {
                        return;
                    }
                    this.error = 'Error al filtrar los estudiantes';
                    this.cargando = false;
                }
            });
    }

    limpiarFiltros(): void {
        this.criterio = '';
        this.suficienciaIdiomaAprobada = null;
        this.semestreActual = null;
        this.cargarEstudiantes();
    }

    exportarResultados(): void {
        if (this.estudiantes.length === 0) {
            return;
        }

        const encabezados = [
            'Nombres',
            'Apellidos',
            'Código',
            'Identificación',
            'Periodo de ingreso',
            'Semestre actual'
        ];
        const filas = this.estudiantes.map(estudiante => [
            estudiante.nombre,
            estudiante.apellido,
            estudiante.codigo,
            estudiante.identificacion,
            estudiante.periodoIngreso,
            estudiante.semestreActual
        ]);
        const contenido = [encabezados, ...filas]
            .map(fila => fila.map(valor => this.formatearValorCsv(valor)).join(';'))
            .join('\r\n');
        const archivo = new Blob([`\uFEFF${contenido}`], {
            type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');

        enlace.href = url;
        enlace.download = `estudiantes-${new Date().toISOString().slice(0, 10)}.csv`;
        enlace.style.display = 'none';
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    get semestreInvalido(): boolean {
        return this.semestreActual !== null
            && (!Number.isInteger(this.semestreActual)
                || !this.semestresDisponibles.includes(this.semestreActual));
    }

    get cantidadFiltrosActivos(): number {
        return Number(this.suficienciaIdiomaAprobada !== null)
            + Number(this.semestreActual !== null);
    }

    seleccionarEstudiante(codigo: string | undefined): void {
        if (!codigo) {
            return;
        }

        this.router.navigate([
            '/gestion-hoja-de-vida/info-estudiante',
            codigo
        ]);
    }

    volver(): void {
        this.router.navigate(['/']);
    }

    get estudiantesPaginados(): Estudiante[] {
        const start = this.page * this.size;
        return this.estudiantes.slice(start, start + this.size);
    }

    siguiente(): void {
        if ((this.page + 1) * this.size < this.estudiantes.length) {
            this.page++;
        }
    }

    anterior(): void {
        if (this.page > 0) {
            this.page--;
        }
    }

    private formatearValorCsv(valor: string | number | null | undefined): string {
        const texto = String(valor ?? '');
        const textoSeguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
        return `"${textoSeguro.replace(/"/g, '""')}"`;
    }

}
