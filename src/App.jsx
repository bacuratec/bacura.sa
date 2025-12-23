import { Suspense, useContext, useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./components/Layouts/dashboard-layout/DashboardLayout";
import AdminLayout from "./components/Layouts/admin-layout/AdminLayout";
import MainLayout from "./components/Layouts/main-layout/MainLayout";
import LoadingPage from "./pages/LoadingPage";
import NotFound from "./pages/not-found/NotFound";

// Landing Pages
import LandingHome from "./pages/landing/home/Home";
import Login from "./pages/landing/login/Login";
import Signup from "./pages/landing/signup/Signup";
import RequestService from "./pages/landing/requestService/RequestService";
import Profile from "./pages/landing/profile/Profile";
import Explore from "./pages/landing/exploreRequests/Explore";
import Projects from "./pages/landing/projects/Projects";
import Reviews from "./pages/landing/reviws/Reviews";

// Provider Pages
import HomeProvider from "./pages/provider/home/Home";
import ActiveOrders from "./pages/provider/active-orders/ActiveOrders";
import OurProjects from "./pages/provider/our-projects/OurProjects";
import OurRates from "./pages/provider/our-rates/OurRates";

// Admin Pages
import HomeAdmin from "./pages/admin/home/Home";

// Admin > Providers
import Providers from "./pages/admin/providers/Providers";

// Admin > Requesters
import Requesters from "./pages/admin/requesters/Requesters";

// Admin > Requests
import Requests from "./pages/admin/requests/Requests";

// Admin > Projects
import ProjectsAdmin from "./pages/admin/projects/Projects";
import ProjectsAdminDetails from "./pages/admin/project-details/ProjectsAdminDetails";

import AuthGuard from "./components/authGuard";
import GuestGuard from "./components/GuestGuard";
import UsersDetails from "./pages/admin/users-details/UsersDetails";
import ProfileDetails from "./pages/admin/profile-details/ProfileDetails";
import RequestDetails from "./pages/admin/request-details/RequestDetails";

import UserRequestDetails from "./pages/landing/request-details/RequestDetails";
import ProjectUserDetails from "./pages/landing/project-details/ProjectUserDetails";
import ProviderProjectsDetails from "./pages/provider/project-details/ProviderProjectsDetails";
import OurServices from "./pages/landing/our-services/OurServices";
import AboutUs from "./pages/landing/about-us/AboutUs";
import HowItWork from "./pages/landing/howItWork/HowItWork";
import Faqs from "./components/landing-components/home-components/faqs/Faqs";
import Partners from "./components/landing-components/home-components/partners/Partners";
import BackToTopButton from "./components/BackTop";
import Tickets from "./pages/landing/tickets/Tickets";
import ServicesPage from "./pages/admin/services/Services";
import TicketsPage from "./pages/admin/tickets/Tickets";
import TicketsDetails from "./pages/admin/tickets/TicketsDetails";
import FaqsAdmin from "./pages/admin/faqs/Faqs";
import AddQuestion from "./components/admin-components/faqs/AddQuestion";
import UpdateQuestion from "./components/admin-components/faqs/UpdateQuestion";

import PartnersAdmin from "./pages/admin/partners/Partners";
import CustomersAdmin from "./pages/admin/customers/Customers";
import UpsertPartner from "./components/admin-components/partners/UpsertPartner";
import UpsertCustomer from "./components/admin-components/customers/UpsertCustomer";
import { LanguageContext } from "./context/LanguageContext";
import i18n from "./i18n";
import ProfileInfo from "./pages/admin/profile-info/ProfileInfo";
// import UpdateQuestion from "./components/admin-components/faqs/UpdateQuestion";

// Reusable Suspense wrapper
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingPage />}>{Component}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard allowedRoles={["Requester"]}>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: withSuspense(<LandingHome />) },

      { path: "request-service", element: withSuspense(<RequestService />) },
      { path: "requests", element: withSuspense(<Explore />) },
      { path: "requests/:id", element: withSuspense(<UserRequestDetails />) },

      { path: "tickets", element: withSuspense(<Tickets />) },
      { path: "projects", element: withSuspense(<Projects />) },
      { path: "projects/:id", element: withSuspense(<ProjectUserDetails />) },
      {
        path: "profile",
        children: [
          { index: true, element: withSuspense(<Profile />) },
          { path: "reviews", element: withSuspense(<Reviews />) },
          { path: "*", element: <NotFound /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "login",
        element: <GuestGuard>{withSuspense(<Login />)}</GuestGuard>,
      },
      {
        path: "signup",
        element: <GuestGuard>{withSuspense(<Signup />)}</GuestGuard>,
      },
      {
        path: "signup-provider",
        element: <GuestGuard>{withSuspense(<Signup />)}</GuestGuard>,
      },

      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/our-services", element: withSuspense(<OurServices />) },
      { path: "/about-us", element: withSuspense(<AboutUs />) },
      { path: "/how-it-work", element: withSuspense(<HowItWork />) },
      {
        path: "/faqs",
        element: withSuspense(
          <>
            <Faqs />
          </>
        ),
      },
      { path: "/partners", element: withSuspense(<Partners />) },
      { path: "*", element: <NotFound /> },
    ],
  },

  {
    path: "/provider",
    element: (
      <AuthGuard allowedRoles={["Provider"]}>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: withSuspense(<HomeProvider />) },
      { path: "active-orders", element: withSuspense(<ActiveOrders />) },
      { path: "our-projects", element: withSuspense(<OurProjects />) },
      { path: "our-rates", element: withSuspense(<OurRates />) },
      { path: "profile", element: withSuspense(<ProfileDetails />) },

      // Tickets
      { path: "tickets", element: withSuspense(<TicketsPage />) },
      { path: "tickets/:id", element: withSuspense(<TicketsDetails />) },
      {
        path: "projects/:id",
        element: withSuspense(<ProviderProjectsDetails />),
      },

      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <AuthGuard allowedRoles={["Admin"]}>
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: withSuspense(<HomeAdmin />) },

      // Providers
      { path: "providers", element: withSuspense(<Providers />) },
      { path: "providers/:id", element: withSuspense(<UsersDetails />) },

      // Requesters
      { path: "requesters", element: withSuspense(<Requesters />) },
      { path: "requesters/:id", element: withSuspense(<UsersDetails />) },

      { path: "profile", element: withSuspense(<ProfileDetails />) },

      // Requests
      { path: "requests", element: withSuspense(<Requests />) },
      { path: "requests/:id", element: withSuspense(<RequestDetails />) },

      // Tickets
      { path: "tickets", element: withSuspense(<TicketsPage />) },
      { path: "tickets/:id", element: withSuspense(<TicketsDetails />) },

      // Services
      { path: "services", element: withSuspense(<ServicesPage />) },
      { path: "tickets/:id", element: withSuspense(<TicketsDetails />) },

      // Projects
      { path: "projects", element: withSuspense(<ProjectsAdmin />) },
      { path: "projects/:id", element: withSuspense(<ProjectsAdminDetails />) },

      { path: "our-rates", element: withSuspense(<OurRates />) },

      { path: "faqs", element: withSuspense(<FaqsAdmin />) },
      { path: "add-questions", element: withSuspense(<AddQuestion />) },
      {
        path: "update-question/:id",
        element: withSuspense(<UpdateQuestion />),
      },

      { path: "partners", element: withSuspense(<PartnersAdmin />) },
      { path: "add-partner", element: withSuspense(<UpsertPartner />) },
      {
        path: "update-partner/:id",
        element: withSuspense(<UpsertPartner />),
      },

      { path: "profile-info", element: withSuspense(<ProfileInfo />) },

      { path: "customers", element: withSuspense(<CustomersAdmin />) },
      { path: "add-customer", element: withSuspense(<UpsertCustomer />) },
      {
        path: "update-customer/:id",
        element: withSuspense(<UpsertCustomer />),
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  const { lang } = useContext(LanguageContext);
  useEffect(() => {
    if (lang && ["en", "ar"].includes(lang)) {
      i18n.changeLanguage(lang);
      document.documentElement.setAttribute(
        "dir",
        lang === "ar" ? "rtl" : "ltr"
      );
    }
  }, [lang]);
  return (
    <div className={lang === "ar" ? "dir-rtl" : "dir-ltr"}>
      <BackToTopButton />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
