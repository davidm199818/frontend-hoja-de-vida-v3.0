export const environment = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4413/api/',

    firebaseConfig: {
        apiKey: window['env']?.FIREBASE_API_KEY || '',
        authDomain: window['env']?.FIREBASE_AUTH_DOMAIN || '',
        projectId: window['env']?.FIREBASE_PROJECT_ID || '',
        storageBucket: window['env']?.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: window['env']?.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: window['env']?.FIREBASE_APP_ID || '',
    },
};

export const gestion_solicitudes = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4412/msmaestriac',
};

export const gestion_autenticacion = {
    production: true,
    api_url:
        window['env']?.AUTENTICACION_API_URL ||
        'http://localhost:8096/api/auth/google',
};

export const gestion_hoja_de_vida = {
    production: true,
    api_url:
        window['env']?.HOJA_VIDA_API_URL ||
        'http://localhost:8080/api/hoja-vida/estudiantes',
};

export const gestion_expertos = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4414/api/',
};

export const gestion_egresados = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4417/api/',
};

export const gestion_trabajo_grado = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4419/api/',
};

export const gestion_docentes_estudiantes = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4414/api/',
};

export const evaluacion_docente = {
    production: true,
    api_url: 'http://localhost:8086/api/',
};
