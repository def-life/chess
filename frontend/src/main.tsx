import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RecoilRoot } from "recoil";
// import React from "react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>

  <RecoilRoot>
    <App />
  </RecoilRoot>,
  // </React.StrictMode>,
);
