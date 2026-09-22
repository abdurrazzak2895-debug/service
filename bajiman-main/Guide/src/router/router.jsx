import { createBrowserRouter } from "react-router";

import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import TopicPage from "../pages/TopicPage/TopicPage";
import ArticlePage from "../pages/ArticlePage/ArticlePage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Referral from "../pages/Referral/Referral";
import VipProgram from "../pages/VipProgram/VipProgram";
import AboutUs from "../pages/AboutUs/AboutUs";
import ContactUs from "../pages/ContactUs/ContactUs";
import ResponsibleGambling from "../pages/ResponsibleGambling/ResponsibleGambling";
import RulesAndRegulations from "../pages/RulesAndRegulations/RulesAndRegulations";
import PrivacyPolicy from "../pages/PrivacyPolicy/PrivacyPolicy";
import TermsAndConditions from "../pages/TermsAndConditions/TermsAndConditions";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "topic/:topicSlug",
        element: <TopicPage />,
      },
      {
        path: "/referral",
        element: <Referral />,
      },
      {
        path: "topic/:topicSlug/:articleSlug",
        element: <ArticlePage />,
      },
       {
        path: "/vip-program",
        element: <VipProgram />,
      },
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/contact-us",
        element: <ContactUs />,
      },
      {
        path: "/responsible-gambling",
        element: <ResponsibleGambling />,
      },
      {
        path: "/rules-and-regulations",
        element: <RulesAndRegulations />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-and-conditions",
        element: <TermsAndConditions />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
