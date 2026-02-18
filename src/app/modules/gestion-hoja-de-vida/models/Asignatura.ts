export interface Asignatura {
  periodoCursado: string;
  codigoMateria: string;
  nombreMateria: string;
  creditos: number;
  notaDefinitiva: number;
  area: 'FUNDAMENTACION' | 'ELECTIVAS' | 'INVESTIGACION' | 'COMPLEMENTACION';
}