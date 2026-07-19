import Header from "./Header";
import background from "../assests/images/bg.png";
import SideNav from "./SideNav";
import FileContainer from "./fileDisplay/FileContainer";

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
        <FileContainer />
      </div>
    </div>
  );
};

export default Home;
