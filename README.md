# Maestria Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Demostración temporal de hoja de vida

Con el backend ejecutándose en el puerto `8080` y con su perfil `demo` habilitado, inicie el frontend con:

```powershell
npm run start:demo
```

Abra `http://localhost:4200/#/gestion-hoja-de-vida/demo` o presione **Login**. Esta configuración muestra el selector de coordinador/estudiante y redirige las solicitudes `/api` al backend mediante `proxy.demo.conf.json`.

Para compartir la demostración desde el equipo local solamente es necesario exponer el frontend:

```powershell
cloudflared tunnel --url http://localhost:4200
```

El comando `npm start` conserva el flujo normal de autenticación y no habilita el acceso temporal.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
