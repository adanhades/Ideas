# 🔥 Guía Completa de Configuración de Firebase

## 📝 Resumen Ejecutivo

Hemos migrado la aplicación TODO List para usar:
- ✅ **Firebase Authentication** - Autenticación segura con email/password
- ✅ **Modelo de datos plano** - Cada tarea y tipo es un documento individual
- ✅ **Security Rules robustas** - Validación y aislamiento de datos por usuario
- ✅ **Sincronización en tiempo real** - Cambios instantáneos entre dispositivos

---

## 🎯 Pasos de Configuración (15 minutos)

### 1️⃣ Crear Proyecto de Firebase

1. Ve a https://console.firebase.google.com/
2. Click en "Agregar proyecto"
3. Nombre: `TODO-App` (o el que prefieras)
4. Desactiva Google Analytics (no lo necesitamos)
5. Click en "Crear proyecto"

### 2️⃣ Habilitar Authentication

1. En el menú lateral, click en **Authentication**
2. Click en "Comenzar"
3. Click en **Correo electrónico/contraseña**
4. Activa el switch de "Correo electrónico/contraseña"
5. Click en "Guardar"

### 3️⃣ Crear los Usuarios

Firebase NO permite cambiar UIDs después de crear usuarios, así que usaremos esta solución:

**Opción A: Usando la API de Admin (Recomendado)**

Ejecuta este código en la consola de Firebase Functions o en un script Node.js local:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function createUsers() {
  try {
    // Crear usuario Hades
    await admin.auth().createUser({
      uid: 'hades',
      email: 'hades@todo-app.com',
      password: 'Hades2025!Secure',
      displayName: 'Hades'
    });
    console.log('✅ Usuario Hades creado');

    // Crear usuario Reiger
    await admin.auth().createUser({
      uid: 'reiger',
      email: 'reiger@todo-app.com',
      password: 'Reiger2025!Secure',
      displayName: 'Reiger'
    });
    console.log('✅ Usuario Reiger creado');
  } catch (error) {
    console.error('Error:', error);
  }
}

createUsers();
```

**Opción B: Usando REST API**

Usa Postman o cURL para crear usuarios con UIDs personalizados:

```bash
# Primero obtén la API Key de tu proyecto en Firebase Console > Configuración del proyecto

# Crear Hades
curl -X POST 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=TU_API_KEY' \
-H 'Content-Type: application/json' \
-d '{
  "email": "hades@todo-app.com",
  "password": "Hades2025!Secure",
  "returnSecureToken": true
}'

# Crear Reiger
curl -X POST 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=TU_API_KEY' \
-H 'Content-Type: application/json' \
-d '{
  "email": "reiger@todo-app.com",
  "password": "Reiger2025!Secure",
  "returnSecureToken": true
}'
```

> ⚠️ **NOTA**: Con la API REST, los UIDs serán generados automáticamente. Necesitarás actualizar el código para mapear emails a UIDs.

**Opción C: Simplificada (Recomendada para testing)**

Modifica el código para usar el UID autogenerado por Firebase:

1. Crea los usuarios manualmente en Firebase Console
2. Anota los UIDs generados
3. Actualiza `script.js` para mapear UIDs:

```javascript
this.userMapping = {
  hades: 'UID_GENERADO_PARA_HADES',
  reiger: 'UID_GENERADO_PARA_REIGER'
};
```

### 4️⃣ Habilitar Firestore Database

1. En el menú lateral, click en **Firestore Database**
2. Click en "Crear base de datos"
3. Selecciona **Modo de producción**
4. Elige una ubicación (recomendado: `us-central` o la más cercana)
5. Click en "Habilitar"

### 5️⃣ Configurar Security Rules

1. Ve a **Firestore Database** > **Reglas**
2. Borra todo el contenido
3. Pega estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check authentication
    function isSignedInAndAuthorized() {
      return request.auth != null && 
             (request.auth.uid == 'hades' || request.auth.uid == 'reiger');
    }

    // Match all documents under a user's path
    match /users/{userId}/{document=**} {
      allow read, write: if isSignedInAndAuthorized() && request.auth.uid == userId;
    }

    // Tasks validation
    match /users/{userId}/tasks/{taskId} {
      allow read: if isSignedInAndAuthorized() && request.auth.uid == userId;

      allow create: if isSignedInAndAuthorized() && 
                       request.auth.uid == userId &&
                       request.resource.data.title is string && 
                       request.resource.data.title.size() > 0 &&
                       request.resource.data.type is string &&
                       request.resource.data.status in ['pending', 'in-progress', 'completed'] &&
                       request.resource.data.priority in ['low', 'medium', 'high'] &&
                       request.resource.data.assignedTo in ['hades', 'reiger'];

      allow update, delete: if isSignedInAndAuthorized() && request.auth.uid == userId;
    }

    // Task Types validation
    match /users/{userId}/taskTypes/{typeId} {
      allow read: if isSignedInAndAuthorized() && request.auth.uid == userId;

      allow create: if isSignedInAndAuthorized() && 
                       request.auth.uid == userId &&
                       request.resource.data.name is string && 
                       request.resource.data.name.size() > 0 &&
                       request.resource.data.color is string &&
                       request.resource.data.emoji is string;

      allow update, delete: if isSignedInAndAuthorized() && request.auth.uid == userId;
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click en **Publicar**

### 6️⃣ Obtener Configuración de Firebase

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. Scroll hasta "Tus apps"
3. Click en el ícono `</>`  (Web)
4. Registra la app con un nombre (ej: "TODO Web App")
5. **NO** marques "También configurar Firebase Hosting"
6. Click en "Registrar app"
7. Copia el objeto `firebaseConfig`

### 7️⃣ Actualizar index.html

Abre `index.html` y reemplaza las líneas 17-22:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",  // ← Pega tu API Key
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123..."
};
```

---

## 🧪 Probar la Aplicación

### Test 1: Login

1. Abre `index.html` en tu navegador
2. Ingresa la llave: `I2D0E2A5S`
3. Selecciona **Hades**
4. Debe iniciar sesión correctamente

**Verificar en Firebase Console:**
- Ve a **Authentication** > **Users**
- Debe mostrar "Última actividad" actualizada para `hades@todo-app.com`

### Test 2: Crear Tarea

1. Click en "Nueva Tarea"
2. Completa:
   - Título: "Tarea de prueba"
   - Tipo: "Personal"
   - Estado: "Pendiente"
   - Prioridad: "Media"
3. Click en "Guardar"

**Verificar en Firebase Console:**
- Ve a **Firestore Database**
- Debe aparecer la estructura:
  ```
  users/
    └── hades/
        └── tasks/
            └── [ID_GENERADO]
  ```

### Test 3: Sincronización en Tiempo Real

1. Abre la app en **dos navegadores diferentes** (o ventanas incógnito)
2. Inicia sesión con **Hades** en ambos
3. En el navegador 1, crea una tarea
4. En el navegador 2, debe aparecer **instantáneamente**

### Test 4: Aislamiento de Usuarios

1. Cierra sesión de Hades
2. Inicia sesión con **Reiger**
3. **NO debe ver** las tareas de Hades
4. Crea una tarea como Reiger
5. Verifica en Firestore que existe en `users/reiger/tasks/`

---

## 🐛 Solución de Problemas

### Error: "Firebase: Error (auth/email-already-in-use)"

✅ **Solución**: El usuario ya existe. Ve a Authentication > Users y elimínalo para recrearlo.

### Error: "Missing or insufficient permissions"

✅ **Solución**: Las Security Rules están bloqueando el acceso. Verifica:
1. El usuario esté autenticado (revisa console de JavaScript)
2. El UID sea exactamente `hades` o `reiger`
3. Las reglas estén publicadas correctamente

### Error: "Firebase: Error (auth/wrong-password)"

✅ **Solución**: La contraseña en `script.js` no coincide con la de Firebase. Actualiza:

```javascript
this.userCredentials = {
    hades: { email: 'hades@todo-app.com', password: 'TU_PASSWORD_CORRECTO' },
    reiger: { email: 'reiger@todo-app.com', password: 'TU_PASSWORD_CORRECTO' }
};
```

### No se sincronizan las tareas en tiempo real

✅ **Solución**: 
1. Abre DevTools > Console
2. Busca errores de Firebase
3. Verifica que `setupRealtimeSync()` se esté ejecutando
4. Revisa que los listeners no se estén deteniendo prematuramente

### La app no carga después de configurar Firebase

✅ **Solución**:
1. Abre DevTools > Console
2. Busca errores de CORS o de configuración
3. Verifica que el `firebaseConfig` esté correcto
4. Asegúrate de tener internet (Firebase requiere conexión)

---

## 📊 Estructura Final de Datos

```
firestore/
└── users/
    ├── hades/
    │   ├── tasks/
    │   │   ├── task-abc123/
    │   │   │   ├── id: "task-abc123"
    │   │   │   ├── title: "Mi tarea"
    │   │   │   ├── description: "Descripción"
    │   │   │   ├── type: "personal"
    │   │   │   ├── status: "pending"
    │   │   │   ├── priority: "high"
    │   │   │   ├── dueDate: "2025-10-25"
    │   │   │   ├── assignedTo: "hades"
    │   │   │   ├── parentId: null
    │   │   │   ├── createdAt: "2025-10-22T..."
    │   │   │   └── updatedAt: "2025-10-22T..."
    │   │   └── task-def456/
    │   │       └── ... (otra tarea)
    │   └── taskTypes/
    │       ├── personal/
    │       │   ├── id: "personal"
    │       │   ├── name: "Personal"
    │       │   ├── color: "#1C6ECC"
    │       │   └── emoji: "📝"
    │       └── trabajo/
    │           └── ... (otro tipo)
    └── reiger/
        ├── tasks/
        └── taskTypes/
```

---

## 🚀 ¡Todo Listo!

Con estos pasos completados, tu aplicación TODO List está usando:

✅ Firebase Authentication para seguridad
✅ Firestore con modelo plano escalable
✅ Security Rules robustas
✅ Sincronización en tiempo real
✅ Aislamiento total de datos por usuario

**¿Necesitas ayuda?** Revisa la consola del navegador (F12) para ver logs detallados de Firebase.

---

## 📌 Recordatorios Importantes

- 🔑 **NUNCA** commits las credenciales de Firebase a Git público
- 🔒 Mantén las contraseñas de usuarios seguras
- 🧪 Prueba TODAS las funcionalidades después de configurar
- 📱 Verifica la sincronización en múltiples dispositivos
- 🔄 Haz backup de datos antes de cualquier cambio mayor

¡Feliz desarrollo! 🎉
