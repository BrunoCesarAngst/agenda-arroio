import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const credPath = process.env.FIREBASE_ADMIN_CREDENTIAL || './credentials/firebase-admin-dev.json';
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listarUsuarios() {
  const usuariosRef = db.collection('usuarios');
  const snapshot = await usuariosRef.get();

  for (const doc of snapshot.docs) {
    console.log(`ID: ${doc.id}`, doc.data());
  }
}

listarUsuarios()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erro ao listar usuários:', err);
    process.exit(1);
  });