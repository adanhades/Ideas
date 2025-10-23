// 📧 Configuración de EmailJS
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales de EmailJS
// Obtén tus credenciales en: https://www.emailjs.com/

export const EMAILJS_CONFIG = {
    // Public Key de tu cuenta EmailJS
    publicKey: 'vP3GTwn1AyQPt8GTR',
    
    // Service ID (el servicio de email que configuraste)
    serviceId: 'service_nbynjjq',
    
    // Template IDs para diferentes tipos de notificaciones
    templates: {
        // Plantilla para nueva tarea asignada
        newTask: 'template_h36cb8h',
        
        // Plantilla para tarea actualizada (usando la misma por ahora)
        taskUpdated: 'template_h36cb8h',
        
        // Plantilla para recordatorio (usando la misma por ahora)
        reminder: 'template_h36cb8h'
    }
};

// 📧 Emails de los usuarios
// Estos emails recibirán las notificaciones
export const USER_EMAILS = {
    hades: 'adan.hades@gmail.com', // Reemplaza con email real
    reiger: 'reiger@todo-app.com' // Reemplaza con email real
};

// ⚙️ Configuración de notificaciones
export const NOTIFICATION_SETTINGS = {
    // Habilitar/deshabilitar notificaciones por email
    emailEnabled: true,
    
    // Habilitar/deshabilitar notificaciones push del navegador
    pushEnabled: true,
    
    // Eventos que disparan notificaciones por email
    emailEvents: {
        taskCreated: true,      // Cuando se crea una tarea
        taskUpdated: true,      // Cuando actualizan una tarea
        taskCompleted: true,    // Cuando completan una tarea
        taskDeleted: true       // Cuando eliminan una tarea
    },
    
    // Eventos que disparan notificaciones push
    pushEvents: {
        taskCreated: true,
        taskUpdated: true,
        taskCompleted: true,
        taskDeleted: true
    }
};
