import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Admin } from "./pages/Admin";
import { DataProducts } from "./pages/DataProducts";
import { DemoWorkbench } from "./pages/DemoWorkbench";
import { Home } from "./pages/Home";
import { MigrateModernize } from "./pages/MigrateModernize";
import { Studios } from "./pages/Studios";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/capability-hub" element={<Navigate to="/studios?mode=capabilities" replace />} />
          <Route path="/data-journey" element={<Navigate to="/studios?mode=journey" replace />} />
          <Route path="/studios" element={<Studios />} />
          <Route path="/data-products" element={<DataProducts />} />
          <Route path="/migrate-modernize" element={<MigrateModernize />} />
          <Route path="/demo-workbench" element={<DemoWorkbench />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
