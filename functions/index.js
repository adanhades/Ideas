const {onDocumentDeleted} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

// Inicializar Firebase Admin
initializeApp();

/**
 * Cloud Function: Validar eliminación de tipos de tareas
 * 
 * Esta función se dispara cuando se elimina un tipo de tarea.
 * Verifica si existen tareas usando ese tipo.
 * Si hay tareas asociadas, restaura el tipo automáticamente.
 * 
 * Ejemplo de uso:
 * - Usuario intenta eliminar tipo "Trabajo"
 * - Si hay 3 tareas con tipo "Trabajo", la función restaura el tipo
 * - El usuario recibe feedback de que el tipo no se puede eliminar
 */
exports.validateTypeDelete = onDocumentDeleted(
    "users/{userId}/taskTypes/{typeId}",
    async (event) => {
      const {userId, typeId} = event.params;
      const deletedType = event.data.data(); // Datos del tipo eliminado

      console.log(`🔍 Validando eliminación de tipo: ${typeId} (usuario: ${userId})`);

      try {
        const db = getFirestore();

        // Buscar tareas que usan este tipo
        const tasksQuery = await db
            .collection("users")
            .doc(userId)
            .collection("tasks")
            .where("type", "==", typeId)
            .get();

        // Si hay tareas usando este tipo, restaurarlo
        if (!tasksQuery.empty) {
          console.log(`⚠️  Tipo ${typeId} tiene ${tasksQuery.size} tareas asociadas`);

          // Restaurar el tipo
          await event.data.ref.set({
            ...deletedType,
            lastUpdated: new Date().toISOString(),
            deletionAttempted: new Date().toISOString(),
            deletionBlocked: true,
            tasksCount: tasksQuery.size,
          });

          console.log(`✅ Tipo ${typeId} restaurado automáticamente`);

          // Opcional: Crear una notificación para el usuario
          await db.collection("users").doc(userId).collection("notifications").add({
            type: "type-deletion-blocked",
            message: `No se puede eliminar el tipo "${deletedType.name}" porque ${tasksQuery.size} tarea(s) lo están usando.`,
            typeId: typeId,
            typeName: deletedType.name,
            tasksCount: tasksQuery.size,
            createdAt: new Date().toISOString(),
            read: false,
          });

          return {
            success: false,
            message: `Tipo restaurado: ${tasksQuery.size} tareas lo usan`,
            typeId,
            tasksCount: tasksQuery.size,
          };
        }

        // Si no hay tareas, permitir la eliminación
        console.log(`✅ Tipo ${typeId} eliminado correctamente (sin tareas asociadas)`);
        return {
          success: true,
          message: "Tipo eliminado exitosamente",
          typeId,
        };
      } catch (error) {
        console.error(`❌ Error al validar eliminación de tipo ${typeId}:`, error);

        // En caso de error, intentar restaurar por seguridad
        try {
          await event.data.ref.set({
            ...deletedType,
            lastUpdated: new Date().toISOString(),
            restoredDueToError: true,
            error: error.message,
          });
          console.log(`🔄 Tipo ${typeId} restaurado por error de validación`);
        } catch (restoreError) {
          console.error(`❌ Error al restaurar tipo ${typeId}:`, restoreError);
        }

        throw error;
      }
    }
);

/**
 * Cloud Function: Limpiar notificaciones antiguas
 * 
 * Se ejecuta diariamente para eliminar notificaciones leídas
 * que tengan más de 7 días.
 */
exports.cleanupOldNotifications = onDocumentDeleted(
    {
      schedule: "every 24 hours",
      timeoutSeconds: 300,
    },
    async () => {
      console.log("🧹 Iniciando limpieza de notificaciones antiguas");

      try {
        const db = getFirestore();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Limpiar para ambos usuarios
        const users = ["hades", "reiger"];

        for (const userId of users) {
          const notificationsRef = db
              .collection("users")
              .doc(userId)
              .collection("notifications");

          const oldNotifications = await notificationsRef
              .where("read", "==", true)
              .where("createdAt", "<", sevenDaysAgo.toISOString())
              .get();

          const batch = db.batch();
          oldNotifications.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });

          await batch.commit();

          console.log(`✅ ${oldNotifications.size} notificaciones eliminadas para ${userId}`);
        }

        return {success: true};
      } catch (error) {
        console.error("❌ Error en limpieza de notificaciones:", error);
        throw error;
      }
    }
);
