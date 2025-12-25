"use client";

import Header from "./header/Header";
import Footer from "./footer/Footer";
import { useGetRequesterDetailsQuery } from "../../../redux/api/usersDetails";
import { useSelector } from "react-redux";
import MobileNavigation from "./header/MobileNavigation";

const MainLayout = ({ children }) => {
  const userId = useSelector((state) => state.auth.userId);
  const { data: userData } = useGetRequesterDetailsQuery(userId, {
    skip: !userId,
  });

  return (
    <>
      <MobileNavigation data={userData} />
      <Header data={userData} />
      <main className="overflow-hidden">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
