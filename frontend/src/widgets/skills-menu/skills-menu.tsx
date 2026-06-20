import styles from "./skills-menu.module.css";
import { CategoryIcon } from "./category-icon";
import { useSelector } from "../../features/store";
import { categoriesSlice } from "../../features/categories/categoriesSlice";

export const SkillsMenu = () => {
  const categories = useSelector(categoriesSlice.selectors.categoriesSelector);

  const leftColumnCategories = categories.filter((cat) => cat.id % 2 === 1);
  const rightColumnCategories = categories.filter((cat) => cat.id % 2 === 0);

  return (
    <div className={styles.skillsMenu}>
      <div className={styles.columns}>
        <div className={styles.column}>
          {leftColumnCategories.map((category) => (
            <div key={category.id} className={styles.category}>
              <div className={styles.categoryIconContainer}>
                <CategoryIcon categoryName={category.name} />
              </div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryTitle}>{category.name}</h3>
                <ul className={styles.subcategories}>
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.id} className={styles.subcategory}>
                      {subcategory.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.column}>
          {rightColumnCategories.map((category) => (
            <div key={category.id} className={styles.category}>
              <div className={styles.categoryIconContainer}>
                <CategoryIcon categoryName={category.name} />
              </div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryTitle}>{category.name}</h3>
                <ul className={styles.subcategories}>
                  {category.subcategories.map((subcategory) => (
                    <li key={subcategory.id} className={styles.subcategory}>
                      {subcategory.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
