import { useEffect, useState } from "react";
import { getProducts } from "./apis/apis";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <>
      {products.map((p) => (
        <p key={p.id}>{p.name}</p>
      ))}
    </>
  );
}

export default App;
