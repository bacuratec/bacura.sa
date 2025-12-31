import React, { useEffect, useState } from "react";
import { useGetTicketsQuery } from "../../../redux/api/ticketApi";
import LoadingPage from "../../LoadingPage";
const logo = "/vite.png";
import OptimizedImage from "@/components/shared/OptimizedImage";
import TicketModal from "../../../components/landing-components/profile-components/TicketModal";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const Tickets = () => {
  const role = useSelector((state) => state.auth.role);

  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const userId = useSelector((state) => state.auth.userId);

  const [open, setOpen] = useState(false);

  const {
    data: tickets,
    refetch,
    isLoading: isLoadingTickets,
  } = useGetTicketsQuery(userId);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (isLoadingTickets) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <title>{t("ticket.pageTitle")}</title>
      <meta name="description" content={t("ticket.pageDescription")} />
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">{t("ticket.pageTitle")}</h1>
        <p className="text-lg font-medium">{t("ticket.pageDescription")}</p>
      </div>

      {/* Tickets Section */}
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {t("ticket.listTitle")}
        </h2>

        <div className="space-y-6">
          <button
            onClick={() => setOpen(true)}
            className="bg-primary/10 rounded-xl text-sm font-bold py-2 px-4 w-fit block mr-auto"
          >
            {t("ticket.sendTicket")}
          </button>
          <TicketModal open={open} setOpen={setOpen} refetch={refetch} />

          {tickets?.length > 0 ? (
            tickets.map((item) => (
              <div
                key={item?.id}
                className="flex items-start gap-4 p-4 bg-white rounded-xl shadow hover:shadow-md transition duration-300 cursor-pointer"
              >
                <div className="image rounded-full w-16 h-16 overflow-hidden border-2 border-primary relative">
                  <OptimizedImage
                    src={logo}
                    alt="User"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="Info flex-1">
                  <h5 className="font-semibold text-lg text-primary">
                    {item?.title}
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {item?.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <OptimizedImage
                  src={logo}
                  alt="No Tickets"
                  fill
                  className="opacity-70 object-contain"
                />
              </div>
              <p className="text-gray-600 text-lg font-medium">
                {t("ticket.noTicketsTitle")}
              </p>
              {/* <p className="text-sm text-gray-400 mt-1">
                {t("ticket.noTicketsDescription")}
              </p> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
