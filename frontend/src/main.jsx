import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
import Home from "./routes//Home/Home.jsx";
import Park from "./routes/Park/Park.jsx";
import Trail from "./routes/Trail/Trail.jsx";
import Waterfall from "./routes/Waterfall/Waterfall.jsx";
import Register from "./routes/Register/Register.jsx";
import Login from "./routes/Login/Login.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "parques/:parkSlug",
        element: <Park />,
      },
      {
        path: "parques/:parkSlug/trilhas/:trailSlug",
        element: <Trail />,
      },
      {
        path: "parques/:parkSlug/cachoeiras/:waterfallSlug",
        element: <Waterfall />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
