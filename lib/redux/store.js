import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/lib/redux/slices/authSlice";
import { authApi } from "@/src/redux/api/authApi";
import { lookupApi } from "@/src/redux/api/typeApi";
import { citiesApi } from "@/src/redux/api/citiesApi";
import { requestersApi } from "@/src/redux/api/requestersApi";
import { providersApi } from "@/src/redux/api/providersApi";
import { detailsApi } from "@/src/redux/api/usersDetails";
import { servicesApi } from "@/src/redux/api/servicesApi";
import { updateApi } from "@/src/redux/api/updateApi";
import { adminStatisticsApi } from "@/src/redux/api/adminStatisticsApi";
import { ordersApi } from "@/src/redux/api/ordersApi";
import { projectsApi } from "@/src/redux/api/projectsApi";
import { ratingsApi } from "@/src/redux/api/ratingsApi";
import { ticketApi } from "@/src/redux/api/ticketApi";
import { notificationsApi } from "@/src/redux/api/notificationsApi";
import { faqsApi } from "@/src/redux/api/faqsApi";
import { partnersApi } from "@/src/redux/api/partnersApi";
import { paymentApi } from "@/src/redux/api/paymentApi";
import { customersApi } from "@/src/redux/api/customersApi";
import { profileInfoApi } from "@/src/redux/api/profileInfoApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
      [lookupApi.reducerPath]: lookupApi.reducer,
      [citiesApi.reducerPath]: citiesApi.reducer,
      [requestersApi.reducerPath]: requestersApi.reducer,
      [providersApi.reducerPath]: providersApi.reducer,
      [detailsApi.reducerPath]: detailsApi.reducer,
      [servicesApi.reducerPath]: servicesApi.reducer,
      [updateApi.reducerPath]: updateApi.reducer,
      [adminStatisticsApi.reducerPath]: adminStatisticsApi.reducer,
      [ordersApi.reducerPath]: ordersApi.reducer,
      [projectsApi.reducerPath]: projectsApi.reducer,
      [ratingsApi.reducerPath]: ratingsApi.reducer,
      [ticketApi.reducerPath]: ticketApi.reducer,
      [notificationsApi.reducerPath]: notificationsApi.reducer,
      [faqsApi.reducerPath]: faqsApi.reducer,
      [partnersApi.reducerPath]: partnersApi.reducer,
      [customersApi.reducerPath]: customersApi.reducer,
      [profileInfoApi.reducerPath]: profileInfoApi.reducer,
      [paymentApi.reducerPath]: paymentApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(lookupApi.middleware)
        .concat(citiesApi.middleware)
        .concat(requestersApi.middleware)
        .concat(providersApi.middleware)
        .concat(detailsApi.middleware)
        .concat(servicesApi.middleware)
        .concat(updateApi.middleware)
        .concat(adminStatisticsApi.middleware)
        .concat(ordersApi.middleware)
        .concat(projectsApi.middleware)
        .concat(ratingsApi.middleware)
        .concat(ticketApi.middleware)
        .concat(notificationsApi.middleware)
        .concat(faqsApi.middleware)
        .concat(partnersApi.middleware)
        .concat(customersApi.middleware)
        .concat(profileInfoApi.middleware)
        .concat(paymentApi.middleware),
  });
};

// Types are available but not exported in JS files
// Use JSDoc comments for type hints if needed

