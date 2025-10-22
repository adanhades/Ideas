# 📬 Sistema de Notificaciones - Resumen

## 🎯 Comportamiento Actual

### Notificaciones Universales ✅
**Ambos usuarios (Hades y Reiger) son notificados en TODAS las acciones:**

| Acción | Email | Push | Quién recibe |
|--------|-------|------|--------------|
| **Crear tarea** | ✅ | ✅ | El otro usuario (no el creador) |
| **Actualizar tarea** | ✅ | ✅ | El otro usuario (no el editor) |
| **Completar tarea** | ✅ | ✅ | El otro usuario (no quien completó) |
| **Eliminar tarea** | ✅ | ✅ | El otro usuario (no quien eliminó) |

### 📧 Ejemplo de Flujo:

```
Hades crea una tarea "Revisar código"
    ↓
Reiger recibe:
    📧 Email: "Hades creó una tarea - Revisar código"
    🔔 Push: "Hades creó: 'Revisar código'"
```

```
Reiger actualiza la tarea
    ↓
Hades recibe:
    📧 Email: "Reiger actualizó una tarea - Revisar código"
    🔔 Push: "Reiger actualizó: 'Revisar código'"
```

```
Hades completa la tarea
    ↓
Reiger recibe:
    📧 Email: "Hades completó una tarea - Revisar código"
    🔔 Push: "Hades completó: 'Revisar código'"
```

## 🔧 Configuración

### Emails de Usuarios
Edita `notifications-config.js`:

```javascript
export const USER_EMAILS = {
    hades: 'email-real-hades@example.com',  // ← Cambiar aquí
    reiger: 'email-real-reiger@example.com' // ← Cambiar aquí
};
```

### Eventos Habilitados

Todos los eventos están **ACTIVOS por defecto**:

```javascript
emailEvents: {
    taskCreated: true,    // ✅ Crear
    taskUpdated: true,    // ✅ Actualizar
    taskCompleted: true,  // ✅ Completar
    taskDeleted: true     // ✅ Eliminar
},

pushEvents: {
    taskCreated: true,    // ✅ Crear
    taskUpdated: true,    // ✅ Actualizar
    taskCompleted: true,  // ✅ Completar
    taskDeleted: true     // ✅ Eliminar
}
```

### Deshabilitar Eventos (Opcional)

Si no quieres emails de actualizaciones (ejemplo):

```javascript
emailEvents: {
    taskCreated: true,
    taskUpdated: false,   // ← Desactivar
    taskCompleted: true,
    taskDeleted: true
}
```

## 📧 Configuración de EmailJS

### Paso 1: Variables de Plantilla

Tu plantilla debe incluir estas variables:

```
{{to_name}}           - Nombre del receptor (Hades/Reiger)
{{from_name}}         - Nombre de quien hizo la acción
{{task_action}}       - Acción realizada (creó/actualizó/completó/eliminó)
{{task_title}}        - Título de la tarea
{{task_description}}  - Descripción
{{task_type}}         - Tipo de tarea
{{task_priority}}     - Prioridad
{{task_date}}         - Fecha de vencimiento
{{app_url}}           - URL de la app
```

### Paso 2: Plantilla Recomendada

```
Asunto: [TODO App] {{from_name}} {{task_action}} una tarea - {{task_title}}

Hola {{to_name}},

{{from_name}} {{task_action}} una tarea en el proyecto:

📋 Tarea: {{task_title}}
📝 Descripción: {{task_description}}
🏷️ Tipo: {{task_type}}
⏰ Prioridad: {{task_priority}}
👤 Acción realizada por: {{from_name}}
⚡ Acción: {{task_action}}

📅 Fecha: {{task_date}}

Revisa el proyecto completo en: {{app_url}}

---
TODO App - Sistema colaborativo de gestión de tareas
```

### Paso 3: Credenciales

Edita `notifications-config.js`:

```javascript
export const EMAILJS_CONFIG = {
    publicKey: 'TU_PUBLIC_KEY',     // De tu cuenta EmailJS
    serviceId: 'TU_SERVICE_ID',     // Tu servicio Gmail/etc
    templates: {
        newTask: 'TU_TEMPLATE_ID'   // ID de la plantilla creada
    }
};
```

## 🔔 Web Push Notifications

### Activar Push

1. Abre la app: https://todo-app-9b0b6.web.app
2. Inicia sesión
3. Click en el botón 🔔
4. Acepta el permiso en el navegador
5. ¡Listo! Recibirás notificaciones en tiempo real

### Compatibilidad

| Navegador | Push | Email |
|-----------|------|-------|
| Chrome | ✅ | ✅ |
| Edge | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ⚠️ iOS 16.4+ | ✅ |
| Móvil | ✅ | ✅ |

## 🧪 Probar el Sistema

### Test Rápido

1. **Usuario 1** (Hades):
   - Inicia sesión
   - Activa notificaciones push 🔔
   - Crea una tarea

2. **Usuario 2** (Reiger):
   - Inicia sesión en otra ventana/navegador
   - Activa notificaciones push 🔔
   - Verás la notificación push inmediatamente
   - Revisa tu email (si configuraste EmailJS)

3. **Prueba actualizaciones**:
   - Usuario 2 edita la tarea
   - Usuario 1 recibe notificación

4. **Prueba completar**:
   - Usuario 1 completa la tarea
   - Usuario 2 recibe notificación

5. **Prueba eliminar**:
   - Usuario 2 elimina la tarea
   - Usuario 1 recibe notificación

## 📊 Monitoreo

### Logs en Consola

Abre DevTools (F12) y verás:

```
✅ EmailJS inicializado
✅ Push Notifications disponibles
✅ Email enviado: {response}
✅ Push notification mostrada
```

### Errores Comunes

| Error | Solución |
|-------|----------|
| "EmailJS no inicializado" | Verificar credenciales en `notifications-config.js` |
| "Push permission denied" | Usuario rechazó permisos, reactivar desde ajustes del navegador |
| "Email failed" | Verificar Service ID y Template ID |

## 💡 Tips

1. **Emails de prueba**: Usa tus emails personales primero para probar
2. **Push en móvil**: Funciona perfecto, solo agregar app a pantalla de inicio
3. **Sin spam**: Solo notifica al otro usuario, no a ti mismo
4. **Silenciar**: Cambia eventos a `false` en configuración si hay muchas notificaciones

## 🎯 Próximos Pasos

1. ✅ Sistema implementado y funcionando
2. ⏳ Configurar EmailJS (5 minutos)
3. ⏳ Cambiar emails en `notifications-config.js`
4. ✅ Push notifications listas (solo activar con 🔔)

---

**App desplegada**: https://todo-app-9b0b6.web.app  
**Última actualización**: 22 de octubre de 2025
