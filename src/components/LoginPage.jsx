import { useState } from "react";
import { Form, Input } from "./LoginPage.styles.js";

const LoginPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const onChangeUserName = (e) => {
    setUserName(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  return (
    <Form>
      <Input
        placeholder="Username"
        value={userName}
        onChange={onChangeUserName}
      />
      <Input
        placeholder="Password"
        value={password}
        onChange={onChangePassword}
      />
      <button onClick={(e) => e.preventDefault()}>Submit</button>
    </Form>
  );
};

export default LoginPage;
