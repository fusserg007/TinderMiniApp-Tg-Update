import { useQuery } from "@tanstack/react-query";

import type { People } from "../domain/people";

interface Result {
  locked: boolean;
  peoples: People[];
}

// Тестовые данные для демонстрации
const mockPeople: People[] = [
  {
    id: 1,
    firstName: "Анна",
    age: 25,
    description: "Люблю путешествия и фотографию",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
    link: "https://t.me/anna_example"
  },
  {
    id: 2,
    firstName: "Мария",
    age: 23,
    description: "Студентка, изучаю дизайн",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
    link: "https://t.me/maria_example"
  },
  {
    id: 3,
    firstName: "Елена",
    age: 27,
    description: "Работаю в IT, люблю книги",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
    link: "https://t.me/elena_example"
  },
  {
    id: 4,
    firstName: "София",
    age: 24,
    description: "Художница и любитель кофе",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
    link: "https://t.me/sofia_example"
  }
];

function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    keepPreviousData: true,
    queryFn: async () => {
      try {
        const res = await fetch(`/api/get-recommendations`);
        const result = await res.json();

        if (!result.ok) {
          throw new Error(result.error);
        }

        return result.data as Result;
      } catch (error) {
        console.warn("API недоступен, используются тестовые данные:", error);
        
        // Возвращаем тестовые данные
        return {
          locked: false,
          peoples: mockPeople.slice(0, 2) // Берем первых двух для отображения
        } as Result;
      }
    },
  });
}

export default useRecommendations;
