// 🔥 CONFIGURACIÓN DE FIREBASE
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase

export const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

/* 
INSTRUCCIONES PARA OBTENER TUS CREDENCIALES:

1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Click en el ícono de configuración ⚙️ (arriba izquierda)
4. Ve a "Configuración del proyecto"
5. Baja hasta "Tus apps"
6. Selecciona tu app web (o crea una si no existe)
7. Copia los valores del objeto "firebaseConfig"
8. Pégalos arriba reemplazando "TU_API_KEY_AQUI", etc.

EJEMPLO de cómo debería verse:

export const firebaseConfig = {
    apiKey: "AIzaSyB1234567890abcdefghijklmnop",
    authDomain: "todo-app-12345.firebaseapp.com",
    projectId: "todo-app-12345",
    storageBucket: "todo-app-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
*/
