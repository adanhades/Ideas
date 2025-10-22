# 📧 Configuración de EmailJS

## Paso 1: Crear Cuenta en EmailJS

1. Ve a: https://www.emailjs.com/
2. Click en **"Sign Up"** (Registrarse)
3. Usa tu email (puede ser Gmail)
4. Verifica tu email

## Paso 2: Conectar Servicio de Email

1. En el dashboard, ve a **"Email Services"**
2. Click **"Add New Service"**
3. Selecciona tu proveedor (Gmail recomendado):
   - **Gmail**: Más fácil, solo autorizar cuenta
   - Otros: Outlook, Yahoo, etc.
4. Click **"Connect Account"** y autoriza
5. Copia el **Service ID** (ejemplo: `service_abc123`)

## Paso 3: Crear Plantilla de Email

1. Ve a **"Email Templates"**
2. Click **"Create New Template"**
3. Usa esta plantilla:

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

Revisa el proyecto completo en: https://todo-app-9b0b6.web.app

---
TODO App - Sistema colaborativo de gestión de tareas
```

4. Guarda la plantilla
5. Copia el **Template ID** (ejemplo: `template_xyz789`)

## Paso 4: Obtener Public Key

1. Ve a **"Account"** > **"General"**
2. Busca **"Public Key"** (o "API Keys")
3. Copia el **Public Key** (ejemplo: `user_1A2B3C4D5E6F`)

## Paso 5: Configurar en la App

Necesitaré que me proporciones:
- ✅ **Service ID**: service_________
- ✅ **Template ID**: template_________
- ✅ **Public Key**: user_________

Una vez tengas estos datos, los agregaremos al código.

---

## 📧 Emails de los Usuarios

Para que las notificaciones funcionen, necesito los emails reales:

- **Hades**: ¿qué email usar? _______________
- **Reiger**: ¿qué email usar? _______________

(Pueden ser los mismos que usan para login: hades@todo-app.com / reiger@todo-app.com)

---

**¿Ya tienes cuenta en EmailJS o necesitas que te guíe paso a paso?**
