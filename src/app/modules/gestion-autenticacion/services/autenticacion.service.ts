import {
    gestion_autenticacion,
    gestion_hoja_vida,
} from 'src/environments/environment';
import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { MenuService } from 'src/app/core/services/app.menu.service';
import { HttpClient } from '@angular/common/http';
import { AuthToken } from '../models/authToken';
import jwt_decode from 'jwt-decode';

interface Usuario {
    username: string;
    email: string;
    role: string[];
    phoneNumber: string;
    academicCode: string;
    firstName: string;
    lastName: string;
    idType: string;
    idNumber: string;
}

@Injectable({
    providedIn: 'root',
})
export class AutenticacionService {
    private static readonly DEMO_SESSION_KEY = 'hojaVidaDemoSession';
    private static readonly DEMO_EXPIRATION_KEY = 'hojaVidaDemoExpiresAt';

    private isLoggedInStatus: boolean = false;
    private userRole: string = '';
    private loggedInUser: Usuario | null = null;
    loginSuccess$: EventEmitter<void> = new EventEmitter<void>();
    logoutSuccess$: EventEmitter<void> = new EventEmitter<void>();

    private backendAuthUrl = gestion_autenticacion.api_url;

    constructor(
        private afAuth: AngularFireAuth,
        private http: HttpClient,
        private menuService: MenuService,
        private router: Router
    ) {
        if (this.esSesionDemoAlmacenada() && !this.esSesionDemoVigente()) {
            this.limpiarSesionLocal();
        }

        // Recuperar el usuario autenticado del localStorage al iniciar
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            this.isLoggedInStatus = true;
            this.loggedInUser = JSON.parse(storedUser);
        }

        // Suscribirse al estado de autenticación sin sobrescribir loggedInUser
        this.afAuth.authState.subscribe((user) => {
            if (this.esSesionDemoVigente()) {
                return;
            }

            if (user && user.email?.endsWith('@unicauca.edu.co')) {
                this.isLoggedInStatus = true;

                // Configura solo los valores básicos, si no se ha autenticado con backend aún
                if (!this.loggedInUser) {
                    this.loggedInUser = {
                        username: user.displayName || '', // Asigna el nombre de usuario
                        email: user.email,
                        role: [], // Define un arreglo vacío o asigna roles según sea necesario
                        phoneNumber: '',
                        academicCode: '',
                        firstName: '',
                        lastName: '',
                        idType: '',
                        idNumber: '',
                    };
                    localStorage.setItem(
                        'loggedInUser',
                        JSON.stringify(this.loggedInUser)
                    );
                }

                this.menuService.emitAlertLogin();
                this.loginSuccess$.emit();
            } else {
                this.logout();
            }
        });
    }

    login(): void {
        if (gestion_hoja_vida.demo_auth_enabled) {
            this.router.navigate(['/gestion-hoja-de-vida/demo']);
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account', // Forzar el selector de cuenta
        });

        this.afAuth
            .signInWithPopup(provider)
            .then((result) => {
                if (
                    result.user &&
                    result.user.email?.endsWith('@unicauca.edu.co')
                ) {
                    result.user.getIdToken().then((firebaseToken) => {
                        const authToken = new AuthToken(firebaseToken);
                        this.sendTokenToBackend(authToken);
                    });
                } else {
                    this.logout();
                }
            })
            .catch((error) => {});
    }

    private sendTokenToBackend(authToken: AuthToken): void {
        this.http
            .post<{ token: string; tokenOriginal: string }>(
                this.backendAuthUrl,
                authToken
            )
            .subscribe(
                (response) => {
                    const backendAuthToken = AuthToken.nuevoAuthToken(response);
                    const jwtToken = backendAuthToken.token;

                    // Almacenar el beared token proporcionado por el backend
                    const tokenOriginal = response.tokenOriginal;
                    localStorage.setItem('token', tokenOriginal);
                    localStorage.removeItem(
                        AutenticacionService.DEMO_SESSION_KEY
                    );
                    localStorage.removeItem(
                        AutenticacionService.DEMO_EXPIRATION_KEY
                    );

                    this.isLoggedInStatus = true;

                    // Decodificar el token y extraer la información del usuario
                    const decodedToken: any = jwt_decode(jwtToken);
                    this.loggedInUser = {
                        username: decodedToken.username,
                        email: decodedToken.correo,
                        role: decodedToken.rol || [],
                        phoneNumber: decodedToken.telefono,
                        academicCode: decodedToken.codigoAcademico,
                        firstName: decodedToken.nombres,
                        lastName: decodedToken.apellidos,
                        idType: decodedToken.tipoIdentificacion,
                        idNumber: decodedToken.numeroIdentificacion,
                    };

                    // Guardar el usuario decodificado en el localStorage
                    localStorage.setItem(
                        'loggedInUser',
                        JSON.stringify(this.loggedInUser)
                    );

                    this.menuService.emitAlertLogin();
                    this.loginSuccess$.emit();
                },
                (error) => {
                    this.logout();
                }
            );
    }

    establecerSesionDemo(
        accessToken: string,
        expiresAt: string,
        nombre: string,
        rol: string,
        codigoAcademico: string | null
    ): void {
        const partesNombre = nombre.trim().split(/\s+/);

        this.loggedInUser = {
            username: nombre,
            email: '',
            role: [rol],
            phoneNumber: '',
            academicCode: codigoAcademico || '',
            firstName: partesNombre[0] || 'Usuario',
            lastName: 'Demo',
            idType: '',
            idNumber: '',
        };
        this.isLoggedInStatus = true;

        localStorage.setItem('token', accessToken);
        localStorage.setItem(
            'loggedInUser',
            JSON.stringify(this.loggedInUser)
        );
        localStorage.setItem(
            AutenticacionService.DEMO_SESSION_KEY,
            'true'
        );
        localStorage.setItem(
            AutenticacionService.DEMO_EXPIRATION_KEY,
            expiresAt
        );

        this.menuService.emitAlertLogin();
        this.loginSuccess$.emit();
    }

    logout(): void {
        const eraSesionDemo = this.esSesionDemoAlmacenada();

        if (eraSesionDemo && gestion_hoja_vida.demo_auth_enabled) {
            this.limpiarSesionLocal();
            this.router.navigate(['/gestion-hoja-de-vida/demo']);
            this.logoutSuccess$.emit();
            return;
        }

        this.afAuth.signOut().then(() => {
            this.limpiarSesionLocal();
            this.router.navigate(['']);

            // Emitir evento de logout
            this.logoutSuccess$.emit();
        });
    }

    isLoggedIn(): boolean {
        if (this.esSesionDemoAlmacenada() && !this.esSesionDemoVigente()) {
            this.limpiarSesionLocal();
            return false;
        }
        return this.isLoggedInStatus;
    }

    getLoggedInUser(): Usuario | null {
        return this.loggedInUser;
    }

    getRole(): string[] | null {
        return this.loggedInUser ? this.loggedInUser.role : [];
    }

    getFullName(): string {
        return this.loggedInUser ? this.loggedInUser.username : '';
    }

    getEmail(): string {
        return this.loggedInUser ? this.loggedInUser.email : '';
    }

    hasRole(role: string): boolean {
        return this.loggedInUser
            ? this.loggedInUser.role.includes(role)
            : false;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private esSesionDemoAlmacenada(): boolean {
        return (
            localStorage.getItem(AutenticacionService.DEMO_SESSION_KEY) ===
            'true'
        );
    }

    private esSesionDemoVigente(): boolean {
        if (!this.esSesionDemoAlmacenada() || !this.getToken()) {
            return false;
        }

        const expiracion = localStorage.getItem(
            AutenticacionService.DEMO_EXPIRATION_KEY
        );
        const instanteExpiracion = expiracion ? Date.parse(expiracion) : NaN;
        return Number.isFinite(instanteExpiracion)
            && instanteExpiracion > Date.now();
    }

    private limpiarSesionLocal(): void {
        this.isLoggedInStatus = false;
        this.loggedInUser = null;
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('token');
        localStorage.removeItem('est');
        localStorage.removeItem('estEgresado');
        localStorage.removeItem(AutenticacionService.DEMO_SESSION_KEY);
        localStorage.removeItem(AutenticacionService.DEMO_EXPIRATION_KEY);
    }
}
