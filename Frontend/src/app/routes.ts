import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { HomePage } from "./pages/HomePage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { ResultsPage } from "./pages/ResultsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AboutPage } from "./pages/AboutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "analyze", Component: AnalyzePage },
      { path: "results", Component: ResultsPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "about", Component: AboutPage },
    ],
  },
]);
