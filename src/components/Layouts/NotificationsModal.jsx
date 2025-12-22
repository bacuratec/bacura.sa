import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  useGetNotificationsQuery,
  useSeenNotificationsMutation,
} from "../../redux/api/notificationsApi";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export default function NotificationsModal({ open, setOpen }) {
  const { t } = useTranslation();
  const role = useSelector((state) => state.auth.role);
  const token = useSelector((state) => state.auth.token);

  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery(undefined, {
    pollingInterval: 60000,
    skip: !token,
  });

  const [markAsSeen] = useSeenNotificationsMutation();

  useEffect(() => {
    if (open && data.length > 0) {
      const unseenIds = data
        .filter((notification) => !notification.seen)
        .map((n) => n.id);

      if (unseenIds.length > 0) {
        markAsSeen(unseenIds);
      }
    }
  }, [open, data, markAsSeen, refetch]);

  const prevOpen = usePrevious(open);
  useEffect(() => {
    if (role) {
      refetch();
    }
  }, [role, refetch]);
  useEffect(() => {
    if (prevOpen && !open) {
      refetch();
    }
  }, [open, prevOpen, refetch]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-[500]"
      style={{ direction: "rtl" }}
    >
      <DialogBackdrop className="fixed inset-0 bg-gray-500/40" />
      <div className="fixed top-24 rtl:left-4 ltr:right-4 inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-start rtl:justify-end ltr:justify-start p-4 text-start">
          <DialogPanel className="w-[370px] bg-white rounded-xl shadow-xl p-4 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {t("notifications.title")}
            </h2>

            {isLoading || isFetching ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {data.length > 0 ? (
                  <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {[...data].reverse().map((notification, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-md border ${
                          !notification.seen
                            ? "bg-primary/10 border-primary/30"
                            : "bg-gray-100 border-gray-200"
                        }`}
                      >
                        <h3 className="text-sm font-bold text-gray-800 mb-1">
                          {notification.header}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    {t("notifications.empty")}
                  </div>
                )}
              </>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
