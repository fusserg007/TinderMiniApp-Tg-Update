import { useQuery } from "@tanstack/react-query";

function useUser() {
  return useQuery({
    queryKey: ["user"],
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      // Проверяем, запущено ли приложение в Telegram
      const isInTelegram = !!(window as any).Telegram?.WebApp?.initData;
      
      if (isInTelegram) {
        // Если в Telegram, пытаемся получить данные с сервера
        try {
          const initData = (window as any).Telegram.WebApp.initData;
          const res = await fetch(`/api/get-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ initData }),
          });
          const result = await res.json();

          if (!result.ok) {
            throw new Error(result.error);
          }

          return result.data;
        } catch (error) {
          console.warn("Ошибка подключения к серверу, используются тестовые данные:", error);
          // Fallback к тестовым данным если сервер недоступен
        }
      }
      
      // Для тестирования в браузере или если сервер недоступен
      console.warn("Приложение запущено в браузере или сервер недоступен. Используются тестовые данные.");
      
      // Возвращаем тестовые данные пользователя
      return {
        id: 123456789,
        first_name: "Test",
        last_name: "User", 
        username: "testuser",
        language_code: "ru",
        photo_url: null,
        is_premium: false
      };
    },
  });
}

export default useUser;
