import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { authApi } from "./api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { lookupApi } from "./api/typeApi";
import { citiesApi } from "./api/citiesApi";
import { requestersApi } from "./api/requestersApi";
import { providersApi } from "./api/providersApi";
import { detailsApi } from "./api/usersDetails";
import { servicesApi } from "./api/servicesApi";
import { updateApi } from "./api/updateApi";
import { adminStatisticsApi } from "./api/adminStatisticsApi";
import { ordersApi } from "./api/ordersApi";
import { projectsApi } from "./api/projectsApi";
import { ratingsApi } from "./api/ratingsApi";
import { ticketApi } from "./api/ticketApi";
import { notificationsApi } from "./api/notificationsApi";
import { faqsApi } from "./api/faqsApi";
import { partnersApi } from "./api/partnersApi";
import { paymentApi } from "./api/paymentApi";
import { customersApi } from "./api/customersApi";
import { profileInfoApi } from "./api/profileInfoApi";
import { providerStatisticsApi } from "./api/providerStatisticsApi";

export const store = configureStore({
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
    [paymentApi.reducerPath]: paymentApi.reducer,
    [profileInfoApi.reducerPath]: profileInfoApi.reducer,
    [providerStatisticsApi.reducerPath]: providerStatisticsApi.reducer,

    // إضافة slice أو api أخرى هنا
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
      .concat(paymentApi.middleware)
      .concat(providerStatisticsApi.middleware),
});

export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
