import { useState } from "react";
import Upload from "./components/Upload";
import SummaryPanel from "./components/SummaryPanel";
import FraudRingTable from "./components/FraudRingTable";
import GraphView from "./components/GraphView";
import DownloadButton from "./components/DownloadButton";
import { downloadRiftJson, uploadTransactionsJson } from "./api";

function extractAnalysisData(responseData) {
  if (!responseData) {
    return null;
  }

  return (
    responseData.analysis ||
    responseData.result ||
    responseData.data ||
    responseData
  );
}

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file, parsedJson, onUploadProgress) => {
    setLoading(true);
    try {
      const response = await uploadTransactionsJson(file, parsedJson, onUploadProgress);
      const normalizedData = extractAnalysisData(response);
      setAnalysisData(normalizedData);
      return normalizedData;
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!analysisData) {
      throw new Error("No detection output available to export.");
    }

    const exportedBlob = await downloadRiftJson(analysisData);
    const blob = exportedBlob instanceof Blob
      ? exportedBlob
      : new Blob([JSON.stringify(exportedBlob, null, 2)], { type: "application/json" });

    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "fintrace_rift_output.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="min-h-screen box-border bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="m-0 text-3xl font-bold text-slate-900">FINTRACE AI</h1>
          <p className="m-0 text-slate-500">Financial Crime Intelligence Dashboard</p>
        </div>
        <DownloadButton onDownload={handleExport} disabled={!analysisData} />
      </div>

      <div className="mb-5">
        <Upload onUpload={handleUpload} loading={loading} />
      </div>

      <SummaryPanel analysisData={analysisData} />

      <FraudRingTable fraudRings={analysisData?.fraud_rings || []} />

      {analysisData && (
        <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200">
          <h3 className="mt-0 mb-4 text-lg font-semibold text-slate-900">Transaction Network Graph</h3>
          <GraphView data={analysisData} transactions={analysisData?.transactions || []} />
        </div>
      )}
    </div>
  );
}

export default App;
