export type PerfilDemo = 'COORDINADOR' | 'ESTUDIANTE';

export interface PerfilAccesoDemo {
    perfil: PerfilDemo;
    nombre: string;
    rol: string;
    codigoAcademico: string | null;
}

export interface SesionDemo extends PerfilAccesoDemo {
    accessToken: string;
    tokenType: 'Bearer';
    expiresAt: string;
}
