import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { IUser } from "../../entities/types";
import { MainUserCard } from "../main-user-card/main-user-card.tsx";
import styles from "./cards-scrollable-gallery.module.css";

export type CardsScrollableGalleryProps = {
  title: string;
  cards: IUser[];
  currentUserId?: string | null;
  batchSize?: number;
  preloadDistance?: number;
};

export const CardsScrollableGallery = ({
  title,
  cards,
  currentUserId,
  batchSize = 15,
}: CardsScrollableGalleryProps) => {
  const [loadedBatches, setLoadedBatches] = useState<number>(1);
  const [isClient, setIsClient] = useState<boolean>(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef<boolean>(false);
  const lastLoadTimeRef = useRef<number>(0);

  const visibleCards = Math.min(loadedBatches * batchSize, cards.length);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLoadedBatches(1);
      isLoadingRef.current = false;
      lastLoadTimeRef.current = 0;
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [cards]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!entries.length) return;

      const entry = entries[0];

      const shouldLoad = entry.isIntersecting || entry.intersectionRatio > 0.25;
      if (!shouldLoad) {
        return;
      }

      const now = Date.now();
      if (isLoadingRef.current || now - lastLoadTimeRef.current < 100) {
        return;
      }

      const currentLoadedBatches = loadedBatches;
      if (currentLoadedBatches * batchSize >= cards.length) {
        return;
      }

      isLoadingRef.current = true;
      lastLoadTimeRef.current = now;

      setLoadedBatches((prev) => {
        const newBatches = prev + 1;
        const newVisibleCards = newBatches * batchSize;

        if (newVisibleCards >= cards.length) {
          return Math.ceil(cards.length / batchSize);
        }

        return newBatches;
      });

      Promise.resolve().then(() => {
        isLoadingRef.current = false;
      });
    },
    [cards.length, loadedBatches, batchSize],
  );

  useEffect(() => {
    if (!isClient) return;

    try {
      const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: "100px",
        threshold: 0,
      });
      observerRef.current = observer;
    } catch (error) {
      console.error("Failed to create IntersectionObserver:", error);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      isLoadingRef.current = false;
    };
  }, [isClient, handleIntersection]);

  useEffect(() => {
    if (!isClient || !observerRef.current) return;

    const observer = observerRef.current;
    const sentinelElement = sentinelRef.current;

    if (!sentinelElement) return;

    if (visibleCards >= cards.length || cards.length === 0) {
      try {
        observer.unobserve(sentinelElement);
      } catch {
        // Игнорируем если элемент уже не наблюдается
      }
      return;
    }

    try {
      observer.observe(sentinelElement);
    } catch {
      // Игнорируем если элемент уже наблюдается
    }

    return () => {
      try {
        observer.unobserve(sentinelElement);
      } catch {
        // Игнорируем если элемент уже не наблюдается
      }
    };
  }, [isClient, visibleCards, cards.length]);

  const displayedCards = useMemo(
    () => cards.slice(0, visibleCards),
    [cards, visibleCards],
  );

  if (cards.length === 0) {
    return (
      <div>
        <div className={styles.gallery_end_text}>
          <h2>{title}</h2>
        </div>
        <div>
          <p>Нет пользователей для отображения</p>
        </div>
      </div>
    );
  }

  const hasMoreCards = visibleCards < cards.length;

  return (
    <div>
      <div className={styles.card_gallery_header}>
        <h2>{title}</h2>
      </div>
      <div className={styles.card_gallery_main}>
        {displayedCards.map((user) => (
          <MainUserCard
            key={`${currentUserId ?? "guest"}-${user.id}`}
            user={user}
            currentUserId={currentUserId}
          />
        ))}
        {hasMoreCards && (
          <div
            ref={sentinelRef}
            className={styles.scroll_sentinel}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};
