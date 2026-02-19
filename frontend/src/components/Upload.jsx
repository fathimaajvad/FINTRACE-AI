import { useState } from "react";

function formatSize(sizeInBytes) {
  if (!Number.isFinite(sizeInBytes)) {
    return "0 B";
  }

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = sizeInBytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function isJsonFile(file) {
  if (!file) {
    return false;
  }

  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith(".json");
}

function Upload({ onUpload, loading }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetStatus = () => {
    setStatusMessage("");
    setStatusType("idle");
    setUploadProgress(0);
  };

  const selectFile = (selectedFile) => {
    setFile(selectedFile || null);
    resetStatus();
  };

  const handleBrowseChange = (event) => {
    selectFile(event.target.files?.[0] || null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const droppedFile = event.dataTransfer.files?.[0] || null;
    selectFile(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatusType("error");
      setStatusMessage("Please select a JSON file before upload.");
      return;
    }

    if (!isJsonFile(file)) {
      setStatusType("error");
      setStatusMessage("Only .json files are accepted.");
      return;
    }

    try {
      const text = await file.text();
      const parsedJson = JSON.parse(text);

      await onUpload(file, parsedJson, (progressEvent) => {
        if (!progressEvent.total) {
          return;
        }
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      setStatusType("success");
      setStatusMessage("File uploaded and analyzed successfully.");
    } catch (error) {
      const isJsonParseError = error instanceof SyntaxError;
      setStatusType("error");
      setStatusMessage(
        isJsonParseError
          ? "Invalid JSON syntax. Please check your file content."
          : error?.response?.data?.detail || error.message || "Upload failed."
      );
    }
  };

  const statusColor =
    statusType === "success"
      ? "text-emerald-600"
      : statusType === "error"
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200">
      <h3 className="mt-0 mb-4 text-lg font-semibold text-slate-900">Upload Transaction Dataset (JSON)</h3>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <p className="mb-3 mt-0 text-slate-500">Drag and drop a .json file here</p>
        <input id="json-upload" type="file" accept=".json,application/json" onChange={handleBrowseChange} className="hidden" />
        <label htmlFor="json-upload" className="inline-block cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
          Browse File
        </label>
      </div>

      {file && (
        <div className="mt-4 text-slate-700">
          <div><strong>File:</strong> {file.name}</div>
          <div><strong>Size:</strong> {formatSize(file.size)}</div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>
        {loading && (
          <div className="w-44">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <small className="text-slate-500">{uploadProgress}%</small>
          </div>
        )}
      </div>

      {statusMessage && (
        <p className={`mt-3 mb-0 font-semibold ${statusColor}`}>{statusMessage}</p>
      )}
    </div>
  );
}

export default Upload;
