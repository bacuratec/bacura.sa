import Header from "./header/Header";
import Footer from "./footer/Footer";
import { Outlet } from "react-router-dom";
import { useGetRequesterDetailsQuery } from "../../../redux/api/usersDetails";
import { useSelector } from "react-redux";
import MobileNavigation from "./header/MobileNavigation";

const MainLayout = () => {
  const userId = useSelector((state) => state.auth.userId);
  const { data: userData } = useGetRequesterDetailsQuery(userId, {
    skip: !userId,
  });

  return (
    <>
      <MobileNavigation data={userData} />
      <Header data={userData} />
      <main className="overflow-hidden">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
