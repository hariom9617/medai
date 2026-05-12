import { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import axios from 'axios';

export function useFCMToken() {
  useEffect(() => {
    const registerToken = async () => {
      const existingToken = localStorage.getItem('fcm_token');
      if (existingToken) return;

      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        if (permission !== 'granted') return;

        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // Wait for service worker to be active
        await navigator.serviceWorker.ready;

        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        console.log('FCM token:', token || 'No token received');
        
        if (token) {
          console.log('Sending FCM token to backend...');
          await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, { fcmToken: token });
          console.log('FCM token sent to backend successfully');
          localStorage.setItem('fcm_token', token);
        }
      } catch (error) {
        console.error('Error in FCM token registration:', error);
        // Handle errors silently
      }
    };

    registerToken();
  }, []);
}
