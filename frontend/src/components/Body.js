import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import CheckAnswersContainer from "./checkAnswers/CheckAnswersContainer";
import FileContainer from "./fileDisplay/FileContainer";

const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/home",
      element: <Home />,
      children: [
        {
          path: "",
          element: <FileContainer />,
        },
        {
          path: "checkanswers",
          element: <CheckAnswersContainer />,
        },
      ],
    },
  ]);

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
