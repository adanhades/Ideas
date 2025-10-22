// 📬 Sistema de Notificaciones
// Maneja notificaciones por Email (EmailJS) y Push (Web Push API)

import { EMAILJS_CONFIG, USER_EMAILS, NOTIFICATION_SETTINGS } from './notifications-config.js';

export class NotificationManager {
    constructor() {
        this.emailJsInitialized = false;
        this.pushSupported = false;
        this.pushPermission = 'default';
        
        this.init();
    }

    // Inicializar servicios de notificaciones
    async init() {
        // Inicializar EmailJS
        if (NOTIFICATION_SETTINGS.emailEnabled && typeof emailjs !== 'undefined') {
            try {
                emailjs.init(EMAILJS_CONFIG.publicKey);
                this.emailJsInitialized = true;
                console.log('✅ EmailJS inicializado');
            } catch (error) {
                console.error('❌ Error al inicializar EmailJS:', error);
            }
        }

        // Verificar soporte de Push Notifications
        if (NOTIFICATION_SETTINGS.pushEnabled && 'Notification' in window) {
            this.pushSupported = true;
            this.pushPermission = Notification.permission;
            console.log('✅ Push Notifications disponibles');
        }
    }

    // Solicitar permiso para notificaciones push
    async requestPushPermission() {
        if (!this.pushSupported) {
            console.warn('⚠️ Push Notifications no soportadas en este navegador');
            return false;
        }

        if (this.pushPermission === 'granted') {
            return true;
        }

        try {
            const permission = await Notification.requestPermission();
            this.pushPermission = permission;
            
            if (permission === 'granted') {
                console.log('✅ Permiso para notificaciones push concedido');
                return true;
            } else {
                console.log('⚠️ Permiso para notificaciones push denegado');
                return false;
            }
        } catch (error) {
            console.error('❌ Error al solicitar permiso:', error);
            return false;
        }
    }

    // Enviar notificación por email usando EmailJS
    async sendEmail(templateId, templateParams) {
        if (!this.emailJsInitialized) {
            console.warn('⚠️ EmailJS no está inicializado');
            return { success: false, error: 'EmailJS no inicializado' };
        }

        try {
            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                templateId,
                templateParams
            );
            
            console.log('✅ Email enviado:', response);
            return { success: true, response };
        } catch (error) {
            console.error('❌ Error al enviar email:', error);
            return { success: false, error: error.text || error.message };
        }
    }

    // Mostrar notificación push del navegador
    async showPushNotification(title, options = {}) {
        if (!this.pushSupported) {
            console.warn('⚠️ Push Notifications no soportadas');
            return false;
        }

        // Solicitar permiso si no lo tenemos
        if (this.pushPermission !== 'granted') {
            const granted = await this.requestPushPermission();
            if (!granted) return false;
        }

        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });

            // Opcional: Manejar clicks en la notificación
            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            console.log('✅ Push notification mostrada');
            return true;
        } catch (error) {
            console.error('❌ Error al mostrar notificación:', error);
            return false;
        }
    }

    // Notificar cuando se crea una nueva tarea
    async notifyTaskCreated(task, createdBy, assignedTo) {
        const promises = [];
        const creatorName = createdBy === 'hades' ? 'Hades' : 'Reiger';

        // Notificar a AMBOS usuarios (excepto al que creó la tarea)
        const usersToNotify = ['hades', 'reiger'].filter(user => user !== createdBy);

        for (const userId of usersToNotify) {
            const userEmail = USER_EMAILS[userId];
            const userName = userId === 'hades' ? 'Hades' : 'Reiger';

            // Email notification
            if (NOTIFICATION_SETTINGS.emailEvents.taskCreated) {
                const emailParams = {
                    to_email: userEmail,
                    to_name: userName,
                    from_name: creatorName,
                    task_title: task.title,
                    task_description: task.description || 'Sin descripción',
                    task_type: task.type || 'Sin tipo',
                    task_priority: task.priority || 'media',
                    task_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha',
                    task_action: 'creó',
                    app_url: 'https://todo-app-9b0b6.web.app'
                };

                promises.push(
                    this.sendEmail(EMAILJS_CONFIG.templates.newTask, emailParams)
                );
            }
        }

        // Push notification (solo para el usuario actual en el navegador)
        if (NOTIFICATION_SETTINGS.pushEvents.taskCreated) {
            promises.push(
                this.showPushNotification(
                    '📋 Nueva tarea creada',
                    {
                        body: `${creatorName} creó: "${task.title}"`,
                        tag: `task-${task.id}`,
                        requireInteraction: false,
                        vibrate: [200, 100, 200]
                    }
                )
            );
        }

        const results = await Promise.allSettled(promises);
        return results;
    }

    // Notificar cuando se actualiza una tarea
    async notifyTaskUpdated(task, updatedBy, assignedTo) {
        const promises = [];
        const updaterName = updatedBy === 'hades' ? 'Hades' : 'Reiger';

        // Notificar a AMBOS usuarios (excepto al que actualizó)
        const usersToNotify = ['hades', 'reiger'].filter(user => user !== updatedBy);

        for (const userId of usersToNotify) {
            const userEmail = USER_EMAILS[userId];
            const userName = userId === 'hades' ? 'Hades' : 'Reiger';

            // Email notification
            if (NOTIFICATION_SETTINGS.emailEvents.taskUpdated) {
                const emailParams = {
                    to_email: userEmail,
                    to_name: userName,
                    from_name: updaterName,
                    task_title: task.title,
                    task_description: task.description || 'Sin descripción',
                    task_type: task.type || 'Sin tipo',
                    task_priority: task.priority || 'media',
                    task_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha',
                    task_action: 'actualizó',
                    app_url: 'https://todo-app-9b0b6.web.app'
                };

                promises.push(
                    this.sendEmail(EMAILJS_CONFIG.templates.newTask, emailParams)
                );
            }
        }

        // Push notification
        if (NOTIFICATION_SETTINGS.pushEvents.taskUpdated) {
            promises.push(
                this.showPushNotification(
                    '✏️ Tarea actualizada',
                    {
                        body: `${updaterName} actualizó: "${task.title}"`,
                        tag: `task-${task.id}`,
                        requireInteraction: false
                    }
                )
            );
        }

        const results = await Promise.allSettled(promises);
        return results;
    }

    // Notificar cuando se completa una tarea
    async notifyTaskCompleted(task, completedBy, assignedTo) {
        const promises = [];
        const completerName = completedBy === 'hades' ? 'Hades' : 'Reiger';

        // Notificar a AMBOS usuarios (excepto al que completó)
        const usersToNotify = ['hades', 'reiger'].filter(user => user !== completedBy);

        for (const userId of usersToNotify) {
            const userEmail = USER_EMAILS[userId];
            const userName = userId === 'hades' ? 'Hades' : 'Reiger';

            // Email notification
            if (NOTIFICATION_SETTINGS.emailEvents.taskCompleted) {
                const emailParams = {
                    to_email: userEmail,
                    to_name: userName,
                    from_name: completerName,
                    task_title: task.title,
                    task_description: task.description || 'Sin descripción',
                    task_type: task.type || 'Sin tipo',
                    task_priority: task.priority || 'media',
                    task_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha',
                    task_action: 'completó',
                    app_url: 'https://todo-app-9b0b6.web.app'
                };

                promises.push(
                    this.sendEmail(EMAILJS_CONFIG.templates.newTask, emailParams)
                );
            }
        }

        // Push notification
        if (NOTIFICATION_SETTINGS.pushEvents.taskCompleted) {
            promises.push(
                this.showPushNotification(
                    '✅ Tarea completada',
                    {
                        body: `${completerName} completó: "${task.title}"`,
                        tag: `task-${task.id}`,
                        requireInteraction: false
                    }
                )
            );
        }

        const results = await Promise.allSettled(promises);
        return results;
    }

    // Notificar cuando se elimina una tarea
    async notifyTaskDeleted(task, deletedBy) {
        const promises = [];
        const deleterName = deletedBy === 'hades' ? 'Hades' : 'Reiger';

        // Notificar a AMBOS usuarios (excepto al que eliminó)
        const usersToNotify = ['hades', 'reiger'].filter(user => user !== deletedBy);

        for (const userId of usersToNotify) {
            const userEmail = USER_EMAILS[userId];
            const userName = userId === 'hades' ? 'Hades' : 'Reiger';

            // Email notification
            if (NOTIFICATION_SETTINGS.emailEvents.taskDeleted) {
                const emailParams = {
                    to_email: userEmail,
                    to_name: userName,
                    from_name: deleterName,
                    task_title: task.title,
                    task_description: task.description || 'Sin descripción',
                    task_type: task.type || 'Sin tipo',
                    task_priority: task.priority || 'media',
                    task_date: task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha',
                    task_action: 'eliminó',
                    app_url: 'https://todo-app-9b0b6.web.app'
                };

                promises.push(
                    this.sendEmail(EMAILJS_CONFIG.templates.newTask, emailParams)
                );
            }
        }

        // Push notification
        if (NOTIFICATION_SETTINGS.pushEvents.taskDeleted) {
            promises.push(
                this.showPushNotification(
                    '🗑️ Tarea eliminada',
                    {
                        body: `${deleterName} eliminó: "${task.title}"`,
                        tag: `task-${task.id}`,
                        requireInteraction: false
                    }
                )
            );
        }

        const results = await Promise.allSettled(promises);
        return results;
    }

    // Mostrar configuración de notificaciones
    getSettings() {
        return {
            emailJsInitialized: this.emailJsInitialized,
            pushSupported: this.pushSupported,
            pushPermission: this.pushPermission,
            settings: NOTIFICATION_SETTINGS
        };
    }
}
