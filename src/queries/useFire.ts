import { useQuery } from "@tanstack/react-query";

import type { People } from "../domain/people";

export interface Result {
  opened: People[];
  locked: People[];
}

// Тестовые данные для демонстрации
const mockOpenedPeople: People[] = [
  {
    id: 5,
    firstName: "Виктория",
    age: 26,
    description: "Фитнес-тренер и нутрициолог",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
    link: "https://t.me/victoria_example"
  },
  {
    id: 6,
    firstName: "Дарья",
    age: 22,
    description: "Блогер и путешественница",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
    link: "https://t.me/daria_example"
  }
];

const mockLockedPeople: People[] = [
  {
    id: 7,
    firstName: "Алиса",
    age: 28,
    description: "Врач-стоматолог",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face",
    link: "https://t.me/alice_example"
  },
  {
    id: 8,
    firstName: "Ксения",
    age: 25,
    description: "Маркетолог в стартапе",
    photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face",
    link: "https://t.me/ksenia_example"
  }
];

function useFire() {
  return useQuery({
    queryKey: ["fire"],
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      try {
        const res = await fetch(`/api/get-fire`);
        const result = await res.json();

        if (!result.ok) {
          throw new Error(result.error);
        }

        return result.data as Result;
      } catch (error) {
        console.warn("API недоступен, используются тестовые данные:", error);
        
        // Возвращаем тестовые данные
        return {
          opened: mockOpenedPeople,
          locked: mockLockedPeople
        } as Result;
      }
    },
  });
}

export default useFire;
