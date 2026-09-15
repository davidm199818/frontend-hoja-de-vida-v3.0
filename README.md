# Maestria Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Contenedor local para hoja de vida

1. Cree `deploy/front.env` a partir de `deploy/front.env.example` y configure Firebase, autenticación y la URL del backend de hoja de vida.
2. Inicie Docker Desktop.
3. Construya o actualice el único contenedor local:

```powershell
.\deploy\actualizar-contenedor-local.ps1
```

El frontend queda disponible en `http://localhost:4200`. La imagen utiliza Nginx, admite las rutas internas de Angular y recibe las URL de los servicios al iniciar el contenedor.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
