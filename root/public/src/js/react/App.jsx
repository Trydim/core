import React from "react";

import {Test} from "./Test.jsx";

export default function App() {
  const [counter, setCounter] = setState(0);

  const handleClick = () => {
    setCounter(counter + 1);
  };

  return (<div className="App">
    <Test />

    <p>{`The count now is: ${counter}`}</p>
    <button onClick={handleClick}>Click me</button>
  </div>);
}
