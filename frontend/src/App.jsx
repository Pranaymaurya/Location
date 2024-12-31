import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
function App() {
  return (
      <>
      <Outlet/>
      </>
  );
}

export default App;
