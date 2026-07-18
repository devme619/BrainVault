import Header from "./Header";
import background from "../assests/images/bg.png";

const Home = () => {
  return (
    <div>
      <Header />
      <img
        alt="bg"
        src={background}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
    </div>
  );
};

export default Home;
