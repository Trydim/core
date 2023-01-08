import React, {Component} from "react";

import {Test} from "./Test.jsx";

export class App extends Component {
  state = {
    counter: 0
  };

  handleClick = () => {
    this.setState(prevState => {
      return { counter: prevState.counter + 1 };
    });
  };

  render() {
    return (<div className="App">
      <Test />

      <p>{`The count now is: ${this.state.counter}`}</p>
      <button onClick={this.handleClick}>Click me</button>
    </div>);
  }
}
