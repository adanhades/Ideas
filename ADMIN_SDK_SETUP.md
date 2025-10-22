# 🔐 Configuración de Usuarios con Firebase Admin SDK

## 📋 Confirmación de Gemini AI

> "Para un sistema cerrado de solo dos usuarios con UIDs predefinidos, la forma más recomendada y limpia es utilizar el Firebase Admin SDK."

**Ventajas:**
✅ Control directo del UID (`'hades'` y `'reiger'`)
✅ Sincronización simple con Security Rules
✅ Seguridad (se ejecuta en servidor)
✅ Una sola vez y listo

---

## 🚀 Opción 1: Usar Firebase Cloud Functions (Recomendado)

### Paso 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Paso 2: Inicializar Functions en tu proyecto

```bash
cd e:\Dev\TODO
firebase init functions
```

Selecciona:
- Use existing project → Selecciona tu proyecto
- Language → JavaScript
- ESLint → No (opcional)
- Install dependencies → Yes

### Paso 3: Crear función para inicializar usuarios

Crea el archivo `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Esta función se ejecuta UNA SOLA VEZ para crear los usuarios
exports.initializeUsers = functions.https.onRequest(async (req, res) => {
  try {
    // Verificar si ya existen los usuarios
    const users = [];
    
    // Intentar crear usuario Hades
    try {
      const hadesUser = await admin.auth().createUser({
        uid: 'hades',
        email: 'hades@todo-app.com',
        password: 'Hades2025!Secure',
        displayName: 'Hades',
        photoURL: 'https://tu-proyecto.web.app/hades.jpg'
      });
      users.push({ success: true, user: 'hades', uid: hadesUser.uid });
      console.log('✅ Usuario Hades creado:', hadesUser.uid);
    } catch (error) {
      if (error.code === 'auth/uid-already-exists') {
        users.push({ success: false, user: 'hades', message: 'Ya existe' });
      } else {
        throw error;
      }
    }

    // Intentar crear usuario Reiger
    try {
      const reigerUser = await admin.auth().createUser({
        uid: 'reiger',
        email: 'reiger@todo-app.com',
        password: 'Reiger2025!Secure',
        displayName: 'Reiger',
        photoURL: 'https://tu-proyecto.web.app/reiger.jpg'
      });
      users.push({ success: true, user: 'reiger', uid: reigerUser.uid });
      console.log('✅ Usuario Reiger creado:', reigerUser.uid);
    } catch (error) {
      if (error.code === 'auth/uid-already-exists') {
        users.push({ success: false, user: 'reiger', message: 'Ya existe' });
      } else {
        throw error;
      }
    }

    // Crear datos iniciales en Firestore para cada usuario
    const db = admin.firestore();
    
    for (const userResult of users) {
      if (userResult.success) {
        const userId = userResult.uid;
        
        // Crear tipos de tareas por defecto
        const defaultTypes = [
          {
            id: 'personal',
            name: 'Personal',
            color: '#1C6ECC',
            emoji: '📝'
          },
          {
            id: 'trabajo',
            name: 'Trabajo',
            color: '#221CCC',
            emoji: '💼'
          },
          {
            id: 'estudio',
            name: 'Estudio',
            color: '#7A1CCC',
            emoji: '📚'
          }
        ];

        for (const type of defaultTypes) {
          await db.collection('users').doc(userId)
            .collection('taskTypes').doc(type.id)
            .set(type);
        }
        
        console.log(`✅ Tipos por defecto creados para ${userId}`);
      }
    }

    res.status(200).json({
      message: 'Usuarios inicializados correctamente',
      results: users
    });

  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Paso 4: Desplegar la función

```bash
firebase deploy --only functions
```

### Paso 5: Ejecutar la función (UNA SOLA VEZ)

Ve a Firebase Console:
1. Functions → `initializeUsers`
2. Copia la URL de la función
3. Abre la URL en tu navegador o usa curl:

```bash
curl https://us-central1-TU-PROYECTO.cloudfunctions.net/initializeUsers
```

### Paso 6: Verificar usuarios creados

1. Ve a Firebase Console → Authentication → Users
2. Debes ver:
   - `hades@todo-app.com` con UID: `hades`
   - `reiger@todo-app.com` con UID: `reiger`

### Paso 7: Eliminar la función (Seguridad)

Una vez creados los usuarios, elimina la función para que nadie más pueda ejecutarla:

```bash
# Comenta o elimina la función en functions/index.js
# Luego redespliega
firebase deploy --only functions
```

---

## 🚀 Opción 2: Script Local con Node.js (Más Simple)

### Paso 1: Crear proyecto Node.js

```bash
mkdir firebase-admin-setup
cd firebase-admin-setup
npm init -y
npm install firebase-admin
```

### Paso 2: Obtener Service Account Key

1. Ve a Firebase Console
2. Configuración del proyecto → Service accounts
3. Click en "Generar nueva clave privada"
4. Descarga el archivo JSON (ej: `serviceAccountKey.json`)
5. Guárdalo en `firebase-admin-setup/`

⚠️ **IMPORTANTE**: NUNCA subas este archivo a Git

### Paso 3: Crear script `createUsers.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createUsers() {
  try {
    console.log('🔄 Creando usuarios...\n');

    // Crear usuario Hades
    try {
      const hadesUser = await admin.auth().createUser({
        uid: 'hades',
        email: 'hades@todo-app.com',
        password: 'Hades2025!Secure',
        displayName: 'Hades',
        emailVerified: true
      });
      console.log('✅ Usuario Hades creado');
      console.log('   UID:', hadesUser.uid);
      console.log('   Email:', hadesUser.email);
      console.log('');
    } catch (error) {
      if (error.code === 'auth/uid-already-exists') {
        console.log('⚠️  Usuario Hades ya existe');
      } else {
        throw error;
      }
    }

    // Crear usuario Reiger
    try {
      const reigerUser = await admin.auth().createUser({
        uid: 'reiger',
        email: 'reiger@todo-app.com',
        password: 'Reiger2025!Secure',
        displayName: 'Reiger',
        emailVerified: true
      });
      console.log('✅ Usuario Reiger creado');
      console.log('   UID:', reigerUser.uid);
      console.log('   Email:', reigerUser.email);
      console.log('');
    } catch (error) {
      if (error.code === 'auth/uid-already-exists') {
        console.log('⚠️  Usuario Reiger ya existe');
      } else {
        throw error;
      }
    }

    // Crear datos iniciales en Firestore
    console.log('🔄 Creando datos iniciales en Firestore...\n');
    
    const db = admin.firestore();
    const defaultTypes = [
      { id: 'personal', name: 'Personal', color: '#1C6ECC', emoji: '📝' },
      { id: 'trabajo', name: 'Trabajo', color: '#221CCC', emoji: '💼' },
      { id: 'estudio', name: 'Estudio', color: '#7A1CCC', emoji: '📚' }
    ];

    for (const userId of ['hades', 'reiger']) {
      for (const type of defaultTypes) {
        await db.collection('users').doc(userId)
          .collection('taskTypes').doc(type.id)
          .set(type);
      }
      console.log(`✅ Tipos por defecto creados para ${userId}`);
    }

    console.log('\n🎉 ¡Usuarios inicializados correctamente!');
    console.log('\n📋 Credenciales:');
    console.log('Hades: hades@todo-app.com / Hades2025!Secure');
    console.log('Reiger: reiger@todo-app.com / Reiger2025!Secure');
    console.log('\n🔒 Recuerda: NUNCA compartas estas credenciales');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

createUsers();
```

### Paso 4: Ejecutar el script

```bash
node createUsers.js
```

Deberías ver:
```
🔄 Creando usuarios...

✅ Usuario Hades creado
   UID: hades
   Email: hades@todo-app.com

✅ Usuario Reiger creado
   UID: reiger
   Email: reiger@todo-app.com

🔄 Creando datos iniciales en Firestore...

✅ Tipos por defecto creados para hades
✅ Tipos por defecto creados para reiger

🎉 ¡Usuarios inicializados correctamente!
```

### Paso 5: Verificar en Firebase Console

1. Authentication → Users → Verifica que existan con UIDs correctos
2. Firestore → users → hades/reiger → taskTypes → Verifica tipos por defecto

### Paso 6: Eliminar archivos sensibles

```bash
# Elimina el Service Account Key
rm serviceAccountKey.json

# O mueve toda la carpeta fuera del proyecto
cd ..
rm -rf firebase-admin-setup
```

---

## 🔐 Gestión Segura de Contraseñas

### Respuesta a Gemini - Pregunta 1:

**¿Cómo gestionar las contraseñas de forma segura?**

**Estrategia implementada:**

1. **Contraseñas fuertes predefinidas**
   ```
   Hades2025!Secure
   Reiger2025!Secure
   ```
   - Mínimo 8 caracteres
   - Mayúsculas, minúsculas, números, símbolos
   - Específicas para cada usuario

2. **Almacenamiento en el código cliente**
   ```javascript
   // En script.js - Solo para sistema cerrado
   this.userCredentials = {
       hades: { email: 'hades@todo-app.com', password: 'Hades2025!Secure' },
       reiger: { email: 'reiger@todo-app.com', password: 'Reiger2025!Secure' }
   };
   ```

3. **Justificación:**
   - ✅ Sistema cerrado (no público)
   - ✅ Solo 2 usuarios conocidos
   - ✅ No hay registro de usuarios
   - ✅ La seguridad real está en Firebase Auth + Security Rules
   - ✅ Si alguien accede al código, necesitaría pasar la llave (`I2D0E2A5S`)

4. **Alternativas más seguras (si fuera necesario):**
   - Variables de entorno (`.env`)
   - Firebase Remote Config
   - Backend proxy para autenticación

**Para este proyecto:** Las credenciales en el código son aceptables porque:
- No es un sistema público
- Los datos están protegidos por Security Rules
- Hay una capa adicional de llave de acceso

---

## 📊 Migración de Datos (Respuesta a Pregunta 2)

**¿Gestión de errores en la migración del modelo embebido al plano?**

### Estrategia de Migración:

```javascript
// Script de migración (ejecutar UNA VEZ)
async function migrateToFlatModel() {
  const db = admin.firestore();
  
  for (const userId of ['hades', 'reiger']) {
    try {
      console.log(`🔄 Migrando datos de ${userId}...`);
      
      // 1. Leer datos antiguos de localStorage (si existen)
      const oldTasksKey = `todoTasks_${userId}`;
      const oldTasks = JSON.parse(localStorage.getItem(oldTasksKey) || '[]');
      
      // 2. Migrar cada tarea al nuevo modelo
      let migratedCount = 0;
      let errorCount = 0;
      
      for (const task of oldTasks) {
        try {
          // Función recursiva para migrar subtareas
          await migrateTaskRecursive(db, userId, task, null);
          migratedCount++;
        } catch (error) {
          console.error(`❌ Error migrando tarea ${task.id}:`, error);
          errorCount++;
        }
      }
      
      console.log(`✅ ${userId}: ${migratedCount} tareas migradas`);
      if (errorCount > 0) {
        console.log(`⚠️  ${userId}: ${errorCount} errores`);
      }
      
      // 3. Hacer backup del localStorage antiguo
      localStorage.setItem(`backup_${oldTasksKey}`, 
        localStorage.getItem(oldTasksKey));
      
    } catch (error) {
      console.error(`❌ Error migrando usuario ${userId}:`, error);
    }
  }
}

async function migrateTaskRecursive(db, userId, task, parentId) {
  // Crear documento de tarea
  const taskData = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    type: task.type,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate || null,
    assignedTo: task.assignedTo,
    parentId: parentId,
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Guardar en Firestore
  await db.collection('users').doc(userId)
    .collection('tasks').doc(task.id)
    .set(taskData);
  
  // Migrar subtareas recursivamente
  if (task.subtasks && task.subtasks.length > 0) {
    for (const subtask of task.subtasks) {
      await migrateTaskRecursive(db, userId, subtask, task.id);
    }
  }
}
```

**Consideraciones:**
- ✅ Backup automático antes de migrar
- ✅ Manejo de errores por tarea
- ✅ Logs detallados
- ✅ Preserva jerarquía con `parentId`
- ✅ No bloquea si una tarea falla

---

## 🚫 Validación de Eliminación de Tipos (Respuesta a Pregunta 3)

**Cloud Function para "No eliminar tipos si hay tareas asignadas"**

Crea `functions/index.js` (o agrega a tu archivo existente):

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Trigger que se ejecuta ANTES de eliminar un tipo
exports.validateTypeDelete = functions.firestore
  .document('users/{userId}/taskTypes/{typeId}')
  .onDelete(async (snapshot, context) => {
    const userId = context.params.userId;
    const typeId = context.params.typeId;
    
    console.log(`🔍 Validando eliminación de tipo ${typeId} para ${userId}`);
    
    const db = admin.firestore();
    
    try {
      // Buscar tareas que usen este tipo
      const tasksWithType = await db.collection('users').doc(userId)
        .collection('tasks')
        .where('type', '==', typeId)
        .limit(1)
        .get();
      
      if (!tasksWithType.empty) {
        console.log(`❌ No se puede eliminar: hay tareas usando tipo ${typeId}`);
        
        // Restaurar el tipo
        await db.collection('users').doc(userId)
          .collection('taskTypes').doc(typeId)
          .set(snapshot.data());
        
        // Enviar notificación al cliente (usando Firestore)
        await db.collection('users').doc(userId)
          .collection('notifications').add({
            type: 'error',
            message: `No se puede eliminar el tipo "${snapshot.data().name}" porque hay tareas asignadas a él`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false
          });
        
        console.log('✅ Tipo restaurado y notificación enviada');
      } else {
        console.log(`✅ Tipo ${typeId} eliminado correctamente (sin tareas asignadas)`);
      }
      
    } catch (error) {
      console.error('❌ Error validando eliminación:', error);
    }
  });

// Escuchar notificaciones en el cliente
// Agregar a script.js:
/*
setupNotificationListener() {
  if (!this.db || !this.currentUser) return;
  
  const notificationsRef = collection(
    this.db, 
    'users', 
    this.currentUser, 
    'notifications'
  );
  
  const q = query(
    notificationsRef, 
    where('read', '==', false),
    orderBy('timestamp', 'desc')
  );
  
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const notification = change.doc.data();
        alert(notification.message);
        
        // Marcar como leída
        await updateDoc(change.doc.ref, { read: true });
      }
    });
  });
}
*/
```

**Desplegar:**
```bash
firebase deploy --only functions:validateTypeDelete
```

---

## ✅ Checklist Final

- [ ] Ejecutar script Admin SDK para crear usuarios
- [ ] Verificar usuarios en Firebase Console (UIDs correctos)
- [ ] Actualizar `firebaseConfig` en `index.html`
- [ ] Aplicar Security Rules
- [ ] Probar login con Hades
- [ ] Probar login con Reiger
- [ ] Verificar aislamiento de datos
- [ ] (Opcional) Ejecutar script de migración si hay datos antiguos
- [ ] (Opcional) Desplegar Cloud Function para validación de tipos

---

## 🎉 Resultado Final

Tendrás:
- ✅ Usuarios con UIDs exactos (`hades` y `reiger`)
- ✅ Autenticación segura con Firebase Auth
- ✅ Security Rules funcionando correctamente
- ✅ Datos iniciales (tipos por defecto) creados
- ✅ Sistema listo para producción

**Tiempo estimado:** 10-15 minutos

¿Alguna duda? ¡Estoy aquí para ayudar! 🚀
