import { Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Home from "./pages/Home";
import DataJourney from "./pages/DataJourney";
import Studios from "./pages/Studios";
import DataProducts from "./pages/DataProducts";
import SemanticHub from "./pages/SemanticHub";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="data-journey" element={<DataJourney />} />
        <Route path="studios" element={<Studios />} />
        <Route path="data-products" element={<DataProducts />} />
        <Route path="semantic-hub" element={<SemanticHub />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
