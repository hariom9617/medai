importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCUTUK6B0b95IG69Fv67I9r1sJc72TBLWw",
  authDomain: "medai-29526.firebaseapp.com",
  projectId: "medai-29526",
  storageBucket: "medai-29526.firebasestorage.app",
  messagingSenderId: "218387323326",
  appId: "1:218387323326:web:6570a2425dcf061b7b01ef"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification?.title ?? 'MedAI', {
    body: payload.notification?.body ?? '',
    icon: '/favicon.ico',
  });
});
