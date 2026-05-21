import { Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Home from "./pages/Home";
import DataJourney from "./pages/DataJourney";
import Studios from "./pages/Studios";
import IngestionStudio from "./pages/IngestionStudio";
import CreateIngestionPipeline from "./pages/CreateIngestionPipeline";
import ProcessingExtractionStudio from "./pages/ProcessingExtractionStudio";
import DataQualityStudio from "./pages/DataQualityStudio";
import CreateDataQualityRuleSet from "./pages/CreateDataQualityRuleSet";
import DataProducts from "./pages/DataProducts";
import SemanticStudio from "./pages/SemanticStudio";
import CreateSemanticModel from "./pages/CreateSemanticModel";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="data-journey" element={<DataJourney />} />
        <Route path="studios" element={<Studios />} />
        <Route path="studios/ingestion" element={<IngestionStudio />} />
        <Route path="studios/ingestion/create" element={<CreateIngestionPipeline />} />
        <Route path="studios/processing-extraction" element={<ProcessingExtractionStudio />} />
        <Route path="studios/data-quality" element={<DataQualityStudio />} />
        <Route path="studios/data-quality/create" element={<CreateDataQualityRuleSet />} />
        <Route path="studios/semantic" element={<SemanticStudio />} />
        <Route path="studios/semantic/create" element={<CreateSemanticModel />} />
        <Route path="data-products" element={<DataProducts />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
