import { Button } from "../../shared/ui/button/button";
import { PencilIcon } from "../../assets/img/icons/edit";
import style from "./post-reg-proposal-widgets.module.css";
import { useSelector } from "../../features/store";
import { categoriesSelector } from "../../features/categories/categoriesSlice";
import { ImagesAuthorSlider } from "../slider/images-author-slider/images-author-slider";
import { useTempSkillImages } from "../../shared/hooks/useTempSkillImages";
// import { useImages } from "../../shared/hooks/useImages";

export type TProposalWidgetsProps = {
  title: string;
  skillCanTeach: {
    name: string;
    fullDescription: string;
    categoryId: number;
    subCategoryId: number;
  };
  onClickEdit: () => void;
  onClickReady: () => void;
};
export const ProposalWidgets = ({
  title,
  skillCanTeach,
  onClickEdit,
  onClickReady,
}: TProposalWidgetsProps) => {
  const categories = useSelector(categoriesSelector);
  const { tempImages } = useTempSkillImages();
  // const { images } = useImages(); // cause commit is not processed yet
  const categorie = categories.find(
    (item) => item.id == skillCanTeach.categoryId,
  );
  const subcategory = categorie?.subcategories.find(
    (item) => item.id == skillCanTeach.subCategoryId,
  );

  return (
    <div className={style.proposal}>
      <div className={style.proposal_header}>
        {title}
        <p className={style.proposal_header_comment}>
          Пожалуйста, проверьте и подтвердите правильность данных
        </p>
      </div>
      <div className={style.proposal_content}>
        <div className={style.proposal_content_skill}>
          <div className={style.proposal_content_details}>
            <div className={style.proposal_content_title}>
              <h2 className={style.proposal_name}>{skillCanTeach.name}</h2>
              <p className={style.proposal_category}>
                {categorie?.name}
                {" / "}
                {subcategory?.name}
              </p>
            </div>
            <h2 className={style.proposal_content_full}>
              {skillCanTeach.fullDescription}
            </h2>
          </div>
          <div className={style.proposal_buttons}>
            <Button type="secondary" onClick={onClickEdit}>
              <div className={style.proposal_buttons_edit}>
                Редактировать
                <PencilIcon />
              </div>
            </Button>
            <Button type="primary" onClick={onClickReady}>
              <div className={style.proposal_buttons_text}>Готово</div>
            </Button>
          </div>
        </div>
        <div>
          <ImagesAuthorSlider images={tempImages} />
        </div>
      </div>
    </div>
  );
};
