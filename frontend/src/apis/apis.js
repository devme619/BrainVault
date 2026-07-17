export const getProducts = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};
