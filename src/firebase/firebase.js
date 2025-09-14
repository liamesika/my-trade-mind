// src/firebase/firebase.js - Legacy import compatibility layer
// This file provides backward compatibility for components that import from '../firebase/firebase'
// It re-exports from the main firebase-init.js file

import app, { 
  auth, 
  db, 
  firestore, 
  realtimeDb, 
  storage, 
  analytics 
} from '../scripts/firebase-init.js';

export { 
  auth, 
  db, 
  firestore, 
  realtimeDb, 
  storage, 
  analytics 
};

export default app;