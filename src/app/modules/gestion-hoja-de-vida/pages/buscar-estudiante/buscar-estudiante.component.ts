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

        this.hojaDeVidaService.buscar(criterio).subscribe({
            next: (data) => {
                this.estudiantes = data;
                this.cargando = false;
            },
            error: () => {
                this.error = 'Error al buscar estudiantes';
                this.cargando = false;
            }
        });
    }

    cargarEstudiantes(): void {
        this.page = 0;
        this.cargando = true;
        this.error = '';

        this.hojaDeVidaService.listarEstudiantes().subscribe({
            next: (data) => {
                this.estudiantes = data;
                this.cargando = false;
            },
            error: () => {
                this.error = 'Error al cargar los estudiantes';
                this.cargando = false;
            }
        });
    }

    aplicarFiltros(): void {
        if (!this.puedeAplicarFiltros) {
            return;
        }

        this.criterio = '';
        this.page = 0;
        this.cargando = true;
        this.error = '';
        this.estudiantes = [];

        this.hojaDeVidaService
            .filtrar(this.suficienciaIdiomaAprobada, this.semestreActual)
            .subscribe({
                next: (data) => {
                    this.estudiantes = data;
                    this.cargando = false;
                },
                error: () => {
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

    get semestreInvalido(): boolean {
        return this.semestreActual !== null
            && (!Number.isInteger(this.semestreActual) || this.semestreActual <= 0);
    }

    get puedeAplicarFiltros(): boolean {
        const hayFiltro = this.suficienciaIdiomaAprobada !== null || this.semestreActual !== null;
        return hayFiltro && !this.semestreInvalido && !this.cargando;
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

}
