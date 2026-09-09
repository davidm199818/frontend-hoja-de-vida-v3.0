export interface Publicacion {
  codigoPublicacion: number | string;
  creditosAsignados: number;
  acta: string;
  nombrePublicacion: string;
  tipoPublicacion: string;
  nombreRevista: string;
  categoriaIndexada: string;
  urlPublicacion?: string;
  fechaAceptacion: string;
}
