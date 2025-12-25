import userImg from "../../../../assets/images/logo.png";
import logoutIcon from "../../../../assets/icons/logout.svg";
import notifications from "../../../../assets/icons/notifications.svg";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetNotificationsQuery } from "../../../../redux/api/notificationsApi";
import NotificationsModal from "../../NotificationsModal";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "../../LanguageDropdown";

const Header = ({ data }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const token = useSelector((state) => state.auth.token);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: notificationsData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000,
    skip: !token,
  });

  const unseenNotifications =
    notificationsData?.filter((notification) => notification.seen === false) ||
    [];

  const dispatch = useDispatch();

  const imageUrl = data?.profilePictureUrl
    ? `${process.env.NEXT_PUBLIC_APP_BASE_URL || process.env.VITE_APP_BASE_URL || ""}/${data.profilePictureUrl}`
    : userImg;

  return (
    <header className="lg:mr-[250px] sticky top-0 right-0 bg-white py-6 border-b-2 border-b-[#E7E7E7] z-[500]">
      <div className="container">
        <div className="flex items-center justify-between gap-7">
          <Link
            href={"/provider/profile"}
            className="profile flex items-center gap-1"
          >
            <div className="w-10 h-10 overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xs font-medium">
                {t("header.goodMorning")} {data?.name}
              </h1>
              <span className="text-xs font-normal text-[#CCCCCC]">
                {t("header.serviceProvider")}
              </span>
            </div>
          </Link>

          <div className="buttons flex items-center xl:gap-6 lg:gap-4 md:gap-3 sm:gap-2 gap-1">
            <LanguageDropdown />
            <button
              onClick={() => setIsModalOpen(true)}
              className="notification border border-[#ccc] rounded-lg flex items-center gap-1 p-2 font-medium text-sm"
            >
              <img
                src={notifications}
                alt=""
                className="w-5 md:w-6 lg:w-auto"
              />
              <span className="rounded-md bg-primary text-white w-4 h-4 text-[10px] flex items-center justify-center">
                {unseenNotifications?.length}
              </span>
            </button>
            <button
              onClick={async () => {
                await dispatch(logoutUser());
                router.replace("/login");
              }}
              className="logout border border-[#ccc] rounded-lg flex items-center gap-1 p-2 font-medium text-sm"
            >
              <span className="hidden sm:inline">{t("header.logout")}</span>
              <img src={logoutIcon} alt="" className="w-5 md:w-6 lg:w-auto" />
            </button>
            <NotificationsModal open={isModalOpen} setOpen={setIsModalOpen} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
