import { useState } from "react";

function DownloadButton({ onDownload, disabled }) {
	const [isDownloading, setIsDownloading] = useState(false);
	const [error, setError] = useState("");

	const handleDownload = async () => {
		if (!onDownload || disabled) {
			return;
		}

		setError("");
		setIsDownloading(true);

		try {
			await onDownload();
		} catch (downloadError) {
			setError(downloadError?.message || "Download failed");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="flex flex-col items-end gap-2">
			<button
				type="button"
				onClick={handleDownload}
				disabled={disabled || isDownloading}
				className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
			>
				{isDownloading ? "Exporting..." : "Export RIFT JSON"}
			</button>
			{error && <small className="text-red-600">{error}</small>}
		</div>
	);
}

export default DownloadButton;
