import { Fragment, useMemo, useState } from "react";

const PAGE_SIZE = 5;

function toNumber(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRings(fraudRings) {
	return (fraudRings || []).map((ring, index) => ({
		ringId: ring.ring_id || ring.id || `RING-${index + 1}`,
		accounts: ring.member_accounts || ring.accounts || [],
		accountCount: (ring.member_accounts || ring.accounts || []).length,
		pattern: ring.pattern_type || ring.pattern || "Unknown",
		riskScore: toNumber(ring.risk_score ?? ring.risk),
		totalAmount: toNumber(ring.total_transaction_amount ?? ring.total_amount),
		transactionCount: toNumber(ring.transaction_count ?? ring.num_transactions ?? ring.transactions?.length),
		rationale: ring.rationale || ring.detection_rationale || ring.explanation || "No rationale provided",
		transactionPath: ring.transaction_path || ring.flow_path || ring.path || []
	}));
}

function riskColor(score) {
	if (score > 0.8) return "text-red-600";
	if (score >= 0.5) return "text-orange-600";
	return "text-emerald-600";
}

function FraudRingTable({ fraudRings }) {
	const [sortBy, setSortBy] = useState("riskScore");
	const [sortOrder, setSortOrder] = useState("desc");
	const [page, setPage] = useState(1);
	const [expandedRingId, setExpandedRingId] = useState(null);

	const normalizedRings = useMemo(() => normalizeRings(fraudRings), [fraudRings]);

	const sortedRings = useMemo(() => {
		const sorted = [...normalizedRings].sort((left, right) => {
			const leftValue = left[sortBy];
			const rightValue = right[sortBy];

			if (typeof leftValue === "number" && typeof rightValue === "number") {
				return sortOrder === "asc" ? leftValue - rightValue : rightValue - leftValue;
			}

			return sortOrder === "asc"
				? String(leftValue).localeCompare(String(rightValue))
				: String(rightValue).localeCompare(String(leftValue));
		});

		return sorted;
	}, [normalizedRings, sortBy, sortOrder]);

	const totalPages = Math.max(1, Math.ceil(sortedRings.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages);
	const paginatedRings = sortedRings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	const handleSort = (column) => {
		setPage(1);
		if (sortBy === column) {
			setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
			return;
		}
		setSortBy(column);
		setSortOrder("desc");
	};

	if (!normalizedRings.length) {
		return null;
	}

	return (
		<div className="mb-5 rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200">
			<h3 className="mt-0 mb-4 text-lg font-semibold text-slate-900">Detected Fraud Rings</h3>

			<div className="overflow-x-auto">
				<table className="min-w-[920px] w-full border-collapse">
					<thead>
						<tr className="bg-slate-100 text-left">
							{["Ring ID", "Accounts", "Pattern", "Risk Score", "Total Amount", "Tx Count", "Rationale", "Details"].map((header) => (
								<th key={header} className="px-3 py-2.5 text-sm font-semibold text-slate-700">{header}</th>
							))}
						</tr>
						<tr className="bg-slate-50 text-left">
							<th className="px-3 py-2.5"><button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={() => handleSort("ringId")}>Sort</button></th>
							<th className="px-3 py-2.5"><button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={() => handleSort("accountCount")}>Sort</button></th>
							<th className="px-3 py-2.5"><button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={() => handleSort("pattern")}>Sort</button></th>
							<th className="px-3 py-2.5"><button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={() => handleSort("riskScore")}>Sort</button></th>
							<th className="px-3 py-2.5"><button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={() => handleSort("totalAmount")}>Sort</button></th>
							<th className="px-3 py-2.5"><button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50" type="button" onClick={() => handleSort("transactionCount")}>Sort</button></th>
							<th className="px-3 py-2.5 text-xs text-slate-500">-</th>
							<th className="px-3 py-2.5 text-xs text-slate-500">-</th>
						</tr>
					</thead>
					<tbody>
						{paginatedRings.map((ring) => {
							const isExpanded = expandedRingId === ring.ringId;
							return (
								<Fragment key={ring.ringId}>
									<tr className="border-t border-slate-200">
										<td className="px-3 py-2.5 align-top text-sm text-slate-700">{ring.ringId}</td>
										<td className="px-3 py-2.5 align-top text-sm text-slate-700">{ring.accounts.length}</td>
										<td className="px-3 py-2.5 align-top text-sm text-slate-700">{ring.pattern}</td>
										<td className={`px-3 py-2.5 align-top text-sm font-bold ${riskColor(ring.riskScore)}`}>{ring.riskScore.toFixed(2)}</td>
										<td className="px-3 py-2.5 align-top text-sm text-slate-700">{ring.totalAmount.toLocaleString()}</td>
										<td className="px-3 py-2.5 align-top text-sm text-slate-700">{ring.transactionCount}</td>
										<td className="max-w-[280px] whitespace-normal px-3 py-2.5 align-top text-sm text-slate-700">{ring.rationale}</td>
										<td className="px-3 py-2.5 align-top">
											<button
												type="button"
												onClick={() => setExpandedRingId((previous) => (previous === ring.ringId ? null : ring.ringId))}
												className="rounded border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
											>
												{isExpanded ? "Hide" : "Expand"}
											</button>
										</td>
									</tr>
									{isExpanded && (
										<tr className="bg-slate-50">
											<td colSpan={8} className="px-3 py-3">
												<div className="mb-2 text-sm text-slate-700">
													<strong>Accounts:</strong> {ring.accounts.length ? ring.accounts.join(", ") : "No account list provided"}
												</div>
												<div className="text-sm text-slate-700">
													<strong>Transaction Path:</strong>{" "}
													{Array.isArray(ring.transactionPath)
														? ring.transactionPath.join(" → ") || "No flow path provided"
														: String(ring.transactionPath || "No flow path provided")}
												</div>
											</td>
										</tr>
									)}
								</Fragment>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="mt-4 flex items-center justify-between">
				<span className="text-sm text-slate-500">
					Page {currentPage} of {totalPages}
				</span>
				<div className="flex gap-2">
					<button className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => setPage((previous) => Math.max(1, previous - 1))} disabled={currentPage === 1}>
						Previous
					</button>
					<button
						className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
						type="button"
						onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}

export default FraudRingTable;
