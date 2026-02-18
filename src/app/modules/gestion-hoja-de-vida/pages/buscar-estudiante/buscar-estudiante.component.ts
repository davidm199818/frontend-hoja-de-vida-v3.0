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
        this.cargando = true;
        this.error = '';
        this.estudiantes = [];

        this.hojaDeVidaService.buscar(this.criterio).subscribe({
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

    seleccionarEstudiante(documento: string): void {
        this.router.navigate([
            '/gestion-hoja-de-vida/info-estudiante',
            documento
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