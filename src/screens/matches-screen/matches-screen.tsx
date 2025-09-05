import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import cn from "classnames";

import useWebApp from "../../queries/useWebApp";
import useFire from "../../queries/useFire";
import useRecommendations from "../../queries/useRecommendations";
import CircleButton from "./elems/circle-button";
import iconFire from "./icons/fire.svg";
import iconClock from "./icons/clock.svg";
import iconNo from "./icons/no.svg";
import iconYes from "./icons/yes.svg";
import styles from "./matches-screen.module.css";

import { type FC } from "react";

const MatchesScreen: FC = () => {
  const queryClient = useQueryClient();
  const webApp = useWebApp();
  const fire = useFire();
  const recommendations = useRecommendations();

  const isLimited = recommendations.data?.locked || false;
  const [firstPeople, secondPeople] = recommendations.data?.peoples || [];
  const count = fire.data
    ? fire.data.locked?.length + fire.data.opened?.length
    : 0;

  const sendReaction = useCallback(
    async (reaction: "no" | "yes") => {
      webApp.HapticFeedback.selectionChanged();

      try {
        const res = await fetch("/api/send-reaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetUserId: firstPeople?.id, reaction }),
        });
        const result = await res.json();

        if (result.ok) {
          const data = result.data;

          queryClient.setQueryData(["recommendations"], () => {
            return {
              locked: data.locked,
              peoples: [secondPeople, data.newPeople],
            };
          });
        } else {
          throw new Error(result);
        }
      } catch (err) {
        console.warn("API недоступен, имитируем реакцию:", err);
        
        // Имитируем успешную реакцию с тестовыми данными
        const mockNewPeople = {
          id: Math.floor(Math.random() * 1000) + 100,
          firstName: ["Анастасия", "Полина", "Екатерина", "Валерия"][Math.floor(Math.random() * 4)],
          age: Math.floor(Math.random() * 10) + 20,
          description: ["Люблю спорт и активный отдых", "Изучаю иностранные языки", "Работаю в сфере красоты", "Увлекаюсь психологией"][Math.floor(Math.random() * 4)],
          photo: [
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=face"
          ][Math.floor(Math.random() * 4)],
          link: "https://t.me/test_example"
        };

        queryClient.setQueryData(["recommendations"], () => {
          return {
            locked: false,
            peoples: [secondPeople, mockNewPeople],
          };
        });
      }
    },
    [firstPeople, queryClient, secondPeople, webApp]
  );

  const handleBuyScores = useCallback(async () => {
    try {
      const res = await fetch("/api/buy-scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const result = await res.json();

      if (!result.ok) {
        alert("Unknown error, try again");
        return;
      }

      webApp.openInvoice(result.data, (status: string) => {
        if (status !== "paid") return;

        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          queryClient.setQueryData(["recommendations"], (prev: any) => {
            return { ...prev, locked: false };
          });
        }, 1000);
      });
    } catch (err) {
      console.warn("API недоступен, имитируем покупку:", err);
      
      // Имитируем успешную покупку
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(["recommendations"], (prev: any) => {
          return { ...prev, locked: false };
        });
      }, 500);
    }
  }, [queryClient, webApp]);

  useEffect(() => {
    const cleanup = () => {
      webApp.MainButton.hide();
      webApp.MainButton.offClick(handleBuyScores);
    };

    if (!isLimited) return cleanup();

    // Show the main button
    webApp.MainButton.show();
    webApp.MainButton.setText("I want to continue");

    // Open the payment by click
    webApp.MainButton.onClick(handleBuyScores);

    return cleanup;
  }, [isLimited, handleBuyScores, webApp]);

  if (!recommendations.data) return;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <Link
          className={cn(styles.fire, { [styles.actived]: count > 0 })}
          to="/fire"
        >
          <img className={styles.iconFire} src={iconFire} alt="" />
          {count > 0 && <div className={styles.count}>{count}</div>}
        </Link>

        <Link to="/settings">
          <img className={styles.iconClock} src={iconClock} alt="" />
        </Link>
      </div>

      <div className={cn(styles.photo, { [styles.limited]: isLimited })}>
        <img
          className={cn(styles.image, { [styles.first]: true })}
          src={firstPeople.photo}
          alt=""
        />

        <img
          className={cn(styles.image, { [styles.second]: true })}
          src={secondPeople.photo}
          alt=""
        />
      </div>

      <div className={styles.footer}>
        {isLimited ? (
          <div className={styles.message}>
            <p>
              You have already watched more than <span>30 people</span> today!
              I'm sure you'll be noticed soon, let's wait?
            </p>
          </div>
        ) : (
          <>
            <div className={styles.profile}>
              <div className={styles.name}>
                <span>{`${firstPeople.firstName}`}</span>
                {firstPeople.age && <span>{`, ${firstPeople.age}`}</span>}
              </div>
              <div className={styles.description}>
                {firstPeople.description || "No description"}
              </div>
            </div>

            <div className={styles.buttons}>
              <CircleButton onClick={() => sendReaction("no")}>
                <img src={iconNo} alt="" />
              </CircleButton>

              <CircleButton onClick={() => sendReaction("yes")}>
                <img src={iconYes} alt="" />
              </CircleButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchesScreen;
