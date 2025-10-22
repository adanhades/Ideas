const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Emojis por defecto para cada tipo
const typeEmojis = {
    'personal': '📝',
    'trabajo': '💼',
    'estudio': '📚'
};

async function migrateTaskTypes() {
    try {
        console.log('🔄 Iniciando migración de tipos de tareas...\n');
        
        const users = ['hades', 'reiger'];
        
        for (const userId of users) {
            console.log(`\n👤 Migrando tipos para usuario: ${userId}`);
            
            // Obtener todos los tipos del usuario
            const typesRef = db.collection('users').doc(userId).collection('taskTypes');
            const snapshot = await typesRef.get();
            
            if (snapshot.empty) {
                console.log(`   ⚠️  No hay tipos para migrar`);
                continue;
            }
            
            // Actualizar cada tipo con su emoji
            const batch = db.batch();
            let updated = 0;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const typeId = doc.id;
                
                // Si ya tiene emoji, no hacer nada
                if (data.emoji && data.emoji !== 'undefined') {
                    console.log(`   ✓ ${data.name} ya tiene emoji: ${data.emoji}`);
                    return;
                }
                
                // Asignar emoji según el ID
                const emoji = typeEmojis[typeId] || '📌';
                
                batch.update(doc.ref, {
                    emoji: emoji,
                    lastUpdated: new Date().toISOString()
                });
                
                console.log(`   🔧 Actualizando ${data.name} → ${emoji}`);
                updated++;
            });
            
            // Ejecutar las actualizaciones
            if (updated > 0) {
                await batch.commit();
                console.log(`   ✅ ${updated} tipos actualizados para ${userId}`);
            }
        }
        
        console.log('\n✨ ¡Migración completada exitosamente!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

// Ejecutar migración
migrateTaskTypes();
