import Header from "./Header";
import background from "../assests/images/bg.png";
import FileContainer from "./fileDisplay/FileContainer";
import SideNav from "./sidenav/SideNav";
import CheckAnswersContainer from "./checkAnswers/CheckAnswersContainer";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="absolute w-full h-full">
      <Header />
      <img
        alt="bg"
        src={background}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="fixed flex w-full h-full">
        <SideNav />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
