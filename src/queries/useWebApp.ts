function useWebApp() {
  // Проверяем, доступен ли Telegram WebApp API
  if ((window as any).Telegram?.WebApp) {
    const webApp = (window as any).Telegram.WebApp;
    
    // Инициализируем тему сразу при загрузке
    if (webApp.themeParams) {
      const root = document.documentElement;
      root.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color || '#ffffff');
      root.style.setProperty('--tg-theme-secondary-bg-color', webApp.themeParams.secondary_bg_color || '#f1f1f1');
      root.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color || '#000000');
      root.style.setProperty('--tg-theme-hint-color', webApp.themeParams.hint_color || '#999999');
      root.style.setProperty('--tg-theme-link-color', webApp.themeParams.link_color || '#2481cc');
      root.style.setProperty('--tg-theme-button-color', webApp.themeParams.button_color || '#2481cc');
      root.style.setProperty('--tg-theme-button-text', webApp.themeParams.button_text_color || '#ffffff');
    }
    
    return webApp;
  }
  
  // Заглушка для тестирования в браузере
  console.warn("Telegram WebApp API недоступен. Используется заглушка для разработки.");
  
  // Устанавливаем светлую тему по умолчанию для браузера
  const root = document.documentElement;
  root.style.setProperty('--tg-theme-bg-color', '#ffffff');
  root.style.setProperty('--tg-theme-secondary-bg-color', '#f1f1f1');
  root.style.setProperty('--tg-theme-text-color', '#000000');
  root.style.setProperty('--tg-theme-hint-color', '#999999');
  root.style.setProperty('--tg-theme-link-color', '#2481cc');
  root.style.setProperty('--tg-theme-button-color', '#2481cc');
  root.style.setProperty('--tg-theme-button-text', '#ffffff');
  
  return {
    ready: () => {
      console.log("WebApp ready (заглушка)");
      // Имитируем готовность приложения
      document.body.style.visibility = 'visible';
    },
    expand: () => {
      console.log("WebApp expand (заглушка)");
      // Имитируем расширение приложения
      document.body.style.height = '100vh';
    },
    close: () => console.log("WebApp close (заглушка)"),
    initData: "",
    initDataUnsafe: {},
    version: "6.0",
    platform: "unknown",
    colorScheme: "light",
    themeParams: {
      bg_color: "#ffffff",
      secondary_bg_color: "#f1f1f1",
      text_color: "#000000",
      hint_color: "#999999",
      link_color: "#2481cc",
      button_color: "#2481cc",
      button_text_color: "#ffffff"
    },
    isExpanded: true,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    headerColor: "#ffffff",
    backgroundColor: "#ffffff"
  };
}

export default useWebApp;
