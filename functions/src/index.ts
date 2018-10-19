// import * as admin from 'firebase-admin';
// Initializes Cloud Functions.
// admin.initializeApp(functions.config().firebase);
import * as functions from 'firebase-functions';

// import * as images from './images';
//
// export const generateThumbnail = images.generateThumbnail;

export const helloWorld = functions.https.onRequest((request, response) => {
    response.send('Hello from Firebase!\n\n');
});
