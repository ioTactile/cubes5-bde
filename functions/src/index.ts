import { initializeApp, getApps } from 'firebase-admin/app'
if (!getApps().length) initializeApp()

export { createAdmin } from './createAdmin.js'
export { removeAdmin } from './removeAdmin.js'
