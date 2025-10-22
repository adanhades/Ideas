# 🔥 Cloud Functions - TODO App

## Descripción

Este directorio contiene las Cloud Functions de Firebase para la aplicación TODO. Las funciones agregan lógica del lado del servidor para validaciones y automatizaciones que no pueden hacerse solo con Security Rules.

## ⚡ Funciones Implementadas

### 1. `validateTypeDelete`
**Trigger:** `onDocumentDeleted` en `users/{userId}/taskTypes/{typeId}`

**Propósito:** Validar la eliminación de tipos de tareas y prevenir pérdida de integridad de datos.

**Funcionalidad:**
- Se dispara cuando un usuario elimina un tipo de tarea
- Busca si existen tareas usando ese tipo
- Si hay tareas asociadas:
  - **Restaura** automáticamente el tipo eliminado
  - Agrega metadatos: `deletionBlocked: true`, `tasksCount: X`
  - Crea una **notificación** para el usuario explicando el bloqueo
- Si no hay tareas:
  - Permite la eliminación
  - Registra el éxito en logs

**Ejemplo de uso:**
```javascript
// Usuario intenta eliminar tipo "Trabajo"
await deleteDoc(doc(db, 'users', 'hades', 'taskTypes', 'trabajo'));

// Si hay 5 tareas con tipo "Trabajo":
// ✅ Function restaura el tipo automáticamente
// 📬 Se crea notificación: "No se puede eliminar el tipo "Trabajo" porque 5 tarea(s) lo están usando."
```

### 2. `cleanupOldNotifications`
**Trigger:** Programada cada 24 horas

**Propósito:** Limpieza automática de notificaciones antiguas para optimizar el almacenamiento.

**Funcionalidad:**
- Se ejecuta diariamente
- Elimina notificaciones **leídas** con más de 7 días de antigüedad
- Procesa ambos usuarios (hades y reiger)
- Usa batch writes para eficiencia

## 📦 Requisitos

### Plan Firebase
⚠️ **IMPORTANTE**: Cloud Functions requieren el **plan Blaze** (pago por uso) de Firebase.

- **Spark (gratuito):** No soporta Cloud Functions
- **Blaze (pago):** Cuota gratuita incluida:
  - 2M invocaciones/mes gratis
  - 400,000 GB-segundos de tiempo de cómputo gratis
  - 200,000 GHz-segundos de tiempo de CPU gratis
  - 5GB de transferencia de red saliente gratis

Para actualizar: https://console.firebase.google.com/project/todo-app-9b0b6/usage/details

### Dependencias
```json
{
  "firebase-admin": "^12.0.0",
  "firebase-functions": "^5.0.0"
}
```

## 🚀 Despliegue

### 1. Instalar dependencias
```bash
cd functions
npm install
```

### 2. Desplegar
```bash
# Todas las functions
firebase deploy --only functions

# Una function específica
firebase deploy --only functions:validateTypeDelete
```

### 3. Ver logs
```bash
# Ver logs en tiempo real
firebase functions:log

# Ver logs de una function específica
firebase functions:log --only validateTypeDelete
```

## 🧪 Testing Local

### Emulador de Functions
```bash
# Instalar emuladores
firebase init emulators

# Ejecutar emulador
npm run serve
# O directamente:
firebase emulators:start --only functions
```

### Probar la función localmente
```javascript
// En script.js, cambiar la URL base para apuntar al emulador
// const FUNCTIONS_URL = 'http://localhost:5001/todo-app-9b0b6/us-central1';
```

## 📊 Monitoreo

### Firebase Console
1. Ve a: https://console.firebase.google.com/project/todo-app-9b0b6/functions
2. Verás:
   - Invocaciones por función
   - Tiempo de ejecución
   - Errores
   - Costos estimados

### Logs
```bash
# Ver últimos logs
firebase functions:log

# Filtrar por severidad
firebase functions:log --only validateTypeDelete --severity error
```

## 💰 Costos Estimados

Para este proyecto con 2 usuarios:

### `validateTypeDelete`
- **Trigger:** Solo cuando se elimina un tipo
- **Frecuencia estimada:** ~5 veces/mes
- **Tiempo ejecución:** ~300ms
- **Costo mensual:** **$0.00** (dentro de cuota gratuita)

### `cleanupOldNotifications`
- **Trigger:** 1 vez al día
- **Frecuencia:** 30 veces/mes
- **Tiempo ejecución:** ~500ms
- **Costo mensual:** **$0.00** (dentro de cuota gratuita)

**Total estimado:** **$0.00/mes** ✅

> Para apps con más usuarios, los costos escalan proporcionalmente. La cuota gratuita de 2M invocaciones cubre ~66,666 eliminaciones de tipos por mes.

## 🔐 Seguridad

Las functions están protegidas por:

1. **Firebase Admin SDK** - Acceso total solo del servidor
2. **Validación de usuarios** - Solo `hades` y `reiger`
3. **Try-catch robustos** - Manejo de errores con restauración automática
4. **Logs detallados** - Auditoría completa de operaciones

## 🎯 Roadmap

### Futuras funciones propuestas:

1. **`validateTaskAssignment`**
   - Validar que solo hades/reiger puedan ser asignados
   - Rechazar asignaciones a usuarios inexistentes

2. **`generateWeeklyReport`**
   - Ejecutar cada lunes
   - Generar resumen de tareas completadas
   - Enviar por email (opcional)

3. **`autoArchiveCompletedTasks`**
   - Ejecutar mensualmente
   - Mover tareas completadas de hace 3+ meses a colección archive
   - Mantener Firestore limpio

4. **`syncTasksWithCalendar`**
   - Trigger en creación de tarea con fecha
   - Crear evento en Google Calendar (opcional)

## 📚 Referencias

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Cloud Functions v2](https://firebase.google.com/docs/functions/beta/v2-differences)
- [Pricing Calculator](https://firebase.google.com/pricing#blaze-calculator)
- [Best Practices](https://firebase.google.com/docs/functions/best-practices)

## 🆘 Troubleshooting

### Error: "Project must be on Blaze plan"
**Solución:** Actualizar a plan Blaze en Firebase Console

### Error: "Cannot find module 'firebase-functions'"
**Solución:** 
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
```

### Functions no se disparan
**Solución:**
1. Verificar que están desplegadas: `firebase functions:list`
2. Ver logs de errores: `firebase functions:log --severity error`
3. Verificar permisos en Firebase Console

### Timeout en Functions
**Solución:** Aumentar timeout en `index.js`:
```javascript
exports.myFunction = onDocumentDeleted({
  timeoutSeconds: 300, // 5 minutos
}, async (event) => { ... });
```

---

**Última actualización:** 22 de octubre de 2025  
**Versión:** 1.0.0  
**Autor:** TODO App Team
