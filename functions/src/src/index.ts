import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

import * as images from './images';
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
    response.send('Hello from Firebase!');
});

export const generateThumbnail = images.generateThumbnail;
