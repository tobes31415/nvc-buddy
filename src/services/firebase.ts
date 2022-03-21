// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
try {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBwFaxsELgtW236HL88AZpPSzAq34B1wu0",
    authDomain: "nvc-buddy.firebaseapp.com",
    projectId: "nvc-buddy",
    storageBucket: "nvc-buddy.appspot.com",
    messagingSenderId: "661782363299",
    appId: "1:661782363299:web:54edbf5e4dd865cfb1d316",
    measurementId: "G-Z6D37M29K7",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const perf = getPerformance(app);
  analytics.app.automaticDataCollectionEnabled = true;
  perf.dataCollectionEnabled = true;
  perf.instrumentationEnabled = true;
} catch (err) {
  console.error("firebase init failed", err);
}
