'use strict';

import "../css/style.scss";

import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App.jsx";

export default function () {
  createRoot(document.getElementById("root")).render(<App />);
}
