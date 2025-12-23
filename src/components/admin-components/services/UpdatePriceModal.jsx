import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function UpdatePriceModal({ open, setOpen, onSubmit, refetch }) {
  const { t } = useTranslation();

  const [price, setPrice] = useState("");

  const handleSubmit = async () => {
    if (!price || isNaN(price)) {
      toast.error(t("services.toast_invalid_price"));
      return;
    }

    try {
      // استدعاء API أو الكول باك اللي انت هتظبطه
      await onSubmit(Number(price));
      toast.success(t("services.toast_success_update"));
      setOpen(false);
      setPrice("");
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message || t("services.toast_error_update") || "حدث خطأ أثناء تحديث السعر"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-[1000]"
      style={{ direction: "rtl" }}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <DialogPanel className="sm:w-[370px] w-full bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-center mb-6">
              {t("services.update_price")}
            </h2>

            <input
              type="number"
              inputMode="decimal"
              className="w-full border border-gray-300 rounded-lg p-3 text-right"
              placeholder={t("services.enter_new_price")}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSubmit}
                className="bg-primary text-white rounded-xl h-[50px] w-full"
              >
                {t("services.update")}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setPrice("");
                }}
                className="bg-gray-100 text-gray-700 rounded-xl h-[50px] w-full"
              >
                {t("services.back")}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
