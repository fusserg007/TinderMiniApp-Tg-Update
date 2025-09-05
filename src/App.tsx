import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

import WelcomeScreen from "./screens/welcome-screen";
import MatchesScreen from "./screens/matches-screen";
import SettingsScreen from "./screens/settings-screen";
import FireScreen from "./screens/fire-screen";
import useUser from "./queries/useUser";
import useWebApp from "./queries/useWebApp";

import type { FC } from "react";

const Root: FC = () => {
  const user = useUser();
  const webApp = useWebApp();

  useEffect(() => {
    // Инициализируем WebApp сразу
    webApp.ready();
    webApp.expand();
    
    // Скрываем заголовок Telegram если возможно
    if (webApp.setHeaderColor) {
      webApp.setHeaderColor('#ffffff');
    }
    
    // Устанавливаем цвет фона
    if (webApp.setBackgroundColor) {
      webApp.setBackgroundColor('#ffffff');
    }
    
    if (user.isLoading) return;
    if (user.isError) {
      console.error("Ошибка загрузки пользователя:", user.error);
      return;
    }
  }, [user, webApp]);

  // Показываем индикатор загрузки
  if (user.isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: 'var(--app-text-color)',
        backgroundColor: 'var(--app-bg-color)'
      }}>
        Загрузка...
      </div>
    );
  }

  // Показываем ошибку с возможностью повтора
  if (user.isError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: 'var(--app-bg-color)'
      }}>
        <div style={{ fontSize: '18px', color: '#e74c3c', marginBottom: '20px' }}>
          Ошибка загрузки приложения
        </div>
        <div style={{ fontSize: '14px', color: 'var(--app-hint-color)', marginBottom: '20px' }}>
          {user.error instanceof Error ? user.error.message : 'Неизвестная ошибка'}
        </div>
        <button 
          onClick={() => user.refetch()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'var(--app-button-color)',
            color: 'var(--app-button-text-color)',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
};

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryOnMount: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "/matches",
          element: <MatchesScreen />,
        },
        {
          path: "/settings",
          element: <SettingsScreen />,
        },
        {
          path: "/fire",
          element: <FireScreen />,
        },
        {
          index: true,
          path: "/",
          element: <WelcomeScreen />,
        },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
