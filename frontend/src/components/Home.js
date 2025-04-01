import React from "react";
import { useParams } from "react-router-dom";

const Home = () => {
  const { userId } = useParams();
  return <h2>Welcome User {userId}</h2>;
};

export default Home;
