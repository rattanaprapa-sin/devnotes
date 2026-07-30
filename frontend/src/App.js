import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

import useRealtimeSync from './shared/hooks/useRealtimeSync';

function RealtimeSyncComponent() {
  useRealtimeSync();
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RealtimeSyncComponent />
        <div className="App min-vh-100 font-monospace">
          <RouterProvider router={router} />
          <Toaster 
            position="top-center"
            containerStyle={{
              top: 40,
            }}
            toastOptions={{
              className: 'font-monospace fw-medium shadow-lg',
              style: {
                borderRadius: '50rem',
                background: '#212529',
                color: '#fff',
                padding: '12px 24px',
              },
              success: {
                iconTheme: {
                  primary: '#198754',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#dc3545',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
