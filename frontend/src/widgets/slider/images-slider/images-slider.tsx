// @ts-expect-error - Библиотека @splidejs/react-splide имеет несовместимую конфигурацию типов
import { Splide, SplideSlide } from "@splidejs/react-splide";
// @ts-expect-error - Библиотека @splidejs/react-splide имеет несовместимую конфигурацию типов
import type { Splide as SplideInstance } from "@splidejs/react-splide";
import { useState, useRef } from "react";
import type { Options } from "@splidejs/splide";
import { IMAGES_OPTIONS } from "../constants/sliderOptions";

import "@splidejs/splide/dist/css/splide.min.css";
import styles from "./images-slider.module.css";

type TImagesSliderProps = {
  images: string[];
  options?: Options;
};

export const ImagesSlider: React.FC<TImagesSliderProps> = ({
  images,
  options,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const mainRef = useRef<SplideInstance>(null);
  const thumbsCount = 3;

  if (!images || images.length === 0) {
    return <div className={styles.noImages}>Нет фотографий</div>;
  }

  const total = images.length;
  const visibleTotal = 1 + thumbsCount;
  const remaining = total > visibleTotal ? total - visibleTotal : 0;

  const finalOptions: Options = {
    ...IMAGES_OPTIONS,
    ...options,
    arrows: (options?.arrows ?? IMAGES_OPTIONS.arrows ?? true) && total > 1,
  };

  const getThumbIndices = (): number[] => {
    if (total <= visibleTotal) {
      const indices: number[] = [];

      for (let i = 1; i < total; i++) {
        const nextIdx = (currentIndex + i) % total;
        if (nextIdx !== currentIndex && !indices.includes(nextIdx)) {
          indices.push(nextIdx);
        }
      }

      let offset = 1;
      while (indices.length < thumbsCount && indices.length < total - 1) {
        const prevIdx = (currentIndex - offset + total) % total;
        if (prevIdx !== currentIndex && !indices.includes(prevIdx)) {
          indices.push(prevIdx);
        }
        offset++;
      }

      return indices.slice(0, thumbsCount);
    }

    return Array.from(
      { length: thumbsCount },
      (_, i) => (currentIndex + 1 + i) % total,
    );
  };

  const thumbIndices = getThumbIndices();
  const showPlusOverlay =
    total > visibleTotal && thumbIndices.length === thumbsCount;
  const showThumbsColumn = thumbIndices.length > 0;

  return (
    <div className={styles.sliderWrapper}>
      <Splide
        className={styles.mainSlider}
        options={finalOptions}
        ref={mainRef}
        onMoved={(splide: SplideInstance) => setCurrentIndex(splide.index)}
        key={images.length > 0 ? images[0] : "empty"}
      >
        {images.map((src, i) => (
          <SplideSlide key={src}>
            <img
              src={src}
              alt={`Изображение ${i + 1}`}
              className={styles.mainImage}
            />
          </SplideSlide>
        ))}
      </Splide>

      {showThumbsColumn && (
        <div className={styles.thumbsColumn}>
          {thumbIndices.map((idx, pos) => {
            const isFirst = pos === 0;
            const isLast = pos === thumbIndices.length - 1;
            const showPlus = showPlusOverlay && isLast;

            const thumbClasses = [
              styles.thumb,
              isFirst ? styles.firstThumb : "",
              isLast ? styles.lastThumb : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={pos}
                className={thumbClasses}
                onClick={() => {
                  mainRef.current?.go(idx);
                  setCurrentIndex(idx);
                }}
              >
                <img src={images[idx]} alt="" className={styles.thumbImg} />
                {showPlus && (
                  <div className={styles.plusOverlay}>+{remaining}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
