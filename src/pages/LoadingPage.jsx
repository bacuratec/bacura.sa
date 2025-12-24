import React from "react";
import { useTranslation } from "react-i18next";

const LoadingPage = ({ message, useSkeleton = false, skeletonComponent }) => {
  const { t } = useTranslation();
  const loadingMessage = message || t("loading") || "Loading...";

  // If skeleton component is provided, use it
  if (useSkeleton && skeletonComponent) {
    return skeletonComponent;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
          {loadingMessage}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {t("loading.subtitle") || "Please wait..."}
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
