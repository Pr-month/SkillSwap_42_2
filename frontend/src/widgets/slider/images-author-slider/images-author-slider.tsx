import type { FC } from "react";
import { ImagesSlider } from "../images-slider/images-slider";
// import { useImages } from "../../../shared/hooks/useImages";
import { useMemo, useEffect } from "react";
import type { IUploadedFile } from "../../../entities/types";

import styles from "./images-author-slider.module.css";

type TImagesAuthorSliderProps = {
  images: IUploadedFile[] | File[];
};

export const ImagesAuthorSlider: FC<TImagesAuthorSliderProps> = ({
  images,
}) => {
  // Превращаем File[] в string[] (blob URLs)
  const imageUrls = useMemo(() => {
    return images.map((file) => URL.createObjectURL(file));
  }, [images]);

  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  if (images.length === 0) {
    return <div className={styles.noImages}>Нет загруженных изображений</div>;
  }

  return (
    <ImagesSlider
      images={imageUrls}
      options={{
        arrows: false,
        type: "fade",
      }}
    />
  );
};
