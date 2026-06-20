import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "../widgets/header";
import { Footer } from "../widgets/footer";
import { UsersPage } from "../pages/users-page";
import { NotFound404 } from "../pages/not-found-404/NotFound404";
import { SkillPage } from "../pages/skill-page";
import { useDispatch, useSelector } from "../features/store";
import { getUsers } from "../features/users/usersSlice";
import { getCategories } from "../features/categories/categoriesSlice";
import { getCities } from "../features/cities/citiesSlice";
import styles from "./App.module.css";
import { PopupMenu, type PopupMenuPosition } from "../shared/ui/popup-menu";
import { SkillsMenu } from "../widgets/skills-menu";
import { HeaderMenuAvatarContent } from "../widgets/header-popup-widget/header-menu-avatar-content";
import { NotificationsMenu } from "../widgets/notifications-menu";
import { Login } from "../pages/login";
import { fetchUserData } from "../features/user/actions";
import { RegisterStep1Page } from "../pages/register-step1";
import { RegisterStep2Page } from "../pages/register-step2";
import { RegisterStep3Page } from "../pages/register-step3";
import { ProtectedRoute } from "../shared/ui/protected-route";
import { ServerError500 } from "../pages/server-error-500/ServerError500";
import { Profile } from "../pages/profile/profile";
import { FavouritesPage } from "../pages/favourites-page/favourites-page";
import { UserDataEditFrom } from "../widgets/user-data-edit-form/user-data-edit-from";
import { Loader } from "../shared/ui/loader/loader";

type PopupContent = "skills" | "avatar" | "notifications" | null;

function App() {
  const dispatch = useDispatch();
  const headerRef = useRef<HTMLElement>(null);

  const authChecked = useSelector((store) => store.auth.authChecked);
  const authLoading = useSelector((store) => store.auth.loading);
  const usersLoading = useSelector((store) => store.users.loading);
  const categoriesLoading = useSelector((store) => store.categories.loading);
  const citiesLoading = useSelector((store) => store.cities.loading);

  const showLoader =
    !authChecked ||
    authLoading ||
    usersLoading ||
    categoriesLoading ||
    citiesLoading;

  const [popupState, setPopupState] = useState<{
    isOpen: boolean;
    content: PopupContent;
    position: PopupMenuPosition;
  }>({
    isOpen: false,
    content: null,
    position: "bottom-left",
  });

  const togglePopup = (content: PopupContent, position: PopupMenuPosition) => {
    setPopupState((prev) => {
      if (prev.isOpen && prev.content === content) {
        return {
          ...prev,
          isOpen: false,
          content: null,
        };
      }
      return {
        isOpen: true,
        content,
        position,
      };
    });
    if (headerRef.current) {
      headerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  const closePopup = () => {
    setPopupState({
      isOpen: false,
      content: null,
      position: "bottom-left",
    });
  };

  const renderPopupContent = () => {
    switch (popupState.content) {
      case "skills":
        return <SkillsMenu />;
      case "avatar":
        return <HeaderMenuAvatarContent onClose={closePopup} />;
      case "notifications":
        return <NotificationsMenu />;
      default:
        return null;
    }
  };

  useEffect(() => {
    dispatch(fetchUserData());
    dispatch(getUsers());
    dispatch(getCategories());
    dispatch(getCities());
  }, [dispatch]);

  return (
    <div className={styles.page}>
      <Header
        ref={headerRef}
        handleSkillsClick={() => togglePopup("skills", "bottom-left")}
        onProfileClick={() => togglePopup("avatar", "bottom-right")}
        onNotificationsClick={() =>
          togglePopup("notifications", "bottom-right")
        }
      />
      <main className={styles.content}>
        {showLoader ? (
          <div className={styles.loaderWrapper}>
            <Loader />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<UsersPage />} />
            <Route path="/error" element={<ServerError500 />} />
            <Route path="*" element={<NotFound404 />} />
            <Route
              path="login"
              element={
                <ProtectedRoute forUnAuth>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route path="skill/:id" element={<SkillPage />} />
            <Route
              path="register/step1"
              element={
                <ProtectedRoute forUnAuth>
                  <RegisterStep1Page />
                </ProtectedRoute>
              }
            />
            <Route
              path="register/step2"
              element={
                <ProtectedRoute forUnAuth>
                  <RegisterStep2Page />
                </ProtectedRoute>
              }
            />
            <Route
              path="register/step3"
              element={
                <ProtectedRoute forUnAuth>
                  <RegisterStep3Page />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/*"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            >
              <Route index element={<UserDataEditFrom />} />
            </Route>
            <Route
              path="/profile/*"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            >
              <Route path="favourites" element={<FavouritesPage />} />
              <Route index element={<UserDataEditFrom />} />
            </Route>
          </Routes>
        )}
      </main>
      <Footer allSkillsOnClick={() => togglePopup("skills", "bottom-left")} />

      <PopupMenu
        anchorRef={headerRef}
        isOpen={popupState.isOpen}
        onClose={closePopup}
        position={popupState.position}
      >
        {renderPopupContent()}
      </PopupMenu>
    </div>
  );
}

export default App;
