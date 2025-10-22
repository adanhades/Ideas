const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createUsers() {
  try {
    console.log('🔄 Creando usuarios con UIDs personalizados...\n');

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
        console.log('');
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
        console.log('');
      } else {
        throw error;
      }
    }

    // Crear tipos de tareas por defecto en Firestore
    console.log('🔄 Creando tipos de tareas por defecto en Firestore...\n');
    
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
    console.log('\n📋 Credenciales para iniciar sesión:');
    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│ Hades:  hades@todo-app.com / Hades2025!Secure  │');
    console.log('│ Reiger: reiger@todo-app.com / Reiger2025!Secure│');
    console.log('└─────────────────────────────────────────────────┘');
    console.log('\n🔒 Recuerda: La llave de acceso es: I2D0E2A5S');
    console.log('\n✨ Puedes probar la aplicación abriendo index.html');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

createUsers();
