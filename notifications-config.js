// 📧 Configuración de EmailJS
// IMPORTANTE: Reemplaza estos valores con tus credenciales reales de EmailJS
// Obtén tus credenciales en: https://www.emailjs.com/

export const EMAILJS_CONFIG = {
    // Public Key de tu cuenta EmailJS
    publicKey: 'TU_PUBLIC_KEY_AQUI', // Ejemplo: 'user_1A2B3C4D5E6F'
    
    // Service ID (el servicio de email que configuraste)
    serviceId: 'TU_SERVICE_ID_AQUI', // Ejemplo: 'service_gmail'
    
    // Template IDs para diferentes tipos de notificaciones
    templates: {
        // Plantilla para nueva tarea asignada
        newTask: 'TU_TEMPLATE_ID_AQUI', // Ejemplo: 'template_newtask'
        
        // Plantilla para tarea actualizada
        taskUpdated: 'template_taskupdated',
        
        // Plantilla para recordatorio
        reminder: 'template_reminder'
    }
};

// 📧 Emails de los usuarios
// Estos emails recibirán las notificaciones
export const USER_EMAILS = {
    hades: 'hades@todo-app.com', // Reemplaza con email real
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
        taskCreated: true,      // Cuando se crea una tarea asignada a ti
        taskAssigned: true,     // Cuando te asignan una tarea
        taskUpdated: false,     // Cuando actualizan una tarea tuya
        taskCompleted: false,   // Cuando completan una tarea tuya
        taskDeleted: false      // Cuando eliminan una tarea tuya
    },
    
    // Eventos que disparan notificaciones push
    pushEvents: {
        taskCreated: true,
        taskAssigned: true,
        taskUpdated: true,
        taskCompleted: true,
        taskDeleted: false
    }
};
