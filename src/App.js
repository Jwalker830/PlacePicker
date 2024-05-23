import logo from './logo.svg';
import React, { useState } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PickerMain from "./PickerMain"

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PickerMain/>}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
