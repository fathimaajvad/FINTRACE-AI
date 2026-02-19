function safeNumber(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function countPatterns(rings) {
	const counters = {
		cycle: 0,
		fanIn: 0,
		fanOut: 0,
		shellChain: 0
	};

	rings.forEach((ring) => {
		const label = String(ring?.pattern_type || ring?.pattern || "").toLowerCase();
		if (label.includes("cycle")) counters.cycle += 1;
		if (label.includes("fan-in") || label.includes("fanin") || label.includes("fan in")) counters.fanIn += 1;
		if (label.includes("fan-out") || label.includes("fanout") || label.includes("fan out")) counters.fanOut += 1;
		if (label.includes("shell") || label.includes("chain")) counters.shellChain += 1;
	});

	return counters;
}

function metricColor(variant, value) {
	if (variant === "neutral") {
		return { text: "text-slate-800", bg: "bg-white", border: "border-slate-200" };
	}

	if (value > 0) {
		return { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" };
	}

	return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
}

function SummaryPanel({ analysisData }) {
	if (!analysisData) {
		return null;
	}

	const summary = analysisData.summary || {};
	const fraudRings = Array.isArray(analysisData.fraud_rings) ? analysisData.fraud_rings : [];
	const patternCounts = countPatterns(fraudRings);

	const metrics = [
		{
			label: "Total Transactions Processed",
			value: safeNumber(summary.total_transactions_processed ?? summary.total_transactions ?? analysisData.transactions?.length),
			variant: "neutral"
		},
		{
			label: "Suspicious Accounts Identified",
			value: safeNumber(summary.suspicious_accounts_flagged ?? summary.suspicious_accounts),
			variant: "risk"
		},
		{
			label: "Total Fraud Rings Detected",
			value: safeNumber(summary.fraud_rings_detected ?? fraudRings.length),
			variant: "risk"
		},
		{
			label: "Cycle-Based Structures (3-5)",
			value: safeNumber(summary.cycle_based_structures ?? summary.cycle_structures ?? patternCounts.cycle),
			variant: "risk"
		},
		{
			label: "Fan-in Patterns (10+ to 1)",
			value: safeNumber(summary.fan_in_patterns ?? summary.fan_in_count ?? patternCounts.fanIn),
			variant: "risk"
		},
		{
			label: "Fan-out Patterns (1 to 10+)",
			value: safeNumber(summary.fan_out_patterns ?? summary.fan_out_count ?? patternCounts.fanOut),
			variant: "risk"
		},
		{
			label: "Shell Chain Patterns",
			value: safeNumber(summary.shell_chain_patterns ?? summary.shell_chain_count ?? patternCounts.shellChain),
			variant: "risk"
		}
	];

	return (
		<div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{metrics.map((metric) => {
				const colors = metricColor(metric.variant, metric.value);
				return (
					<div
						key={metric.label}
						className={`rounded-xl border p-4 shadow-sm ${colors.bg} ${colors.border}`}
					>
						<h4 className="mb-2 mt-0 text-sm text-slate-500">{metric.label}</h4>
						<p className={`m-0 text-3xl font-bold ${colors.text}`}>{metric.value}</p>
					</div>
				);
			})}
		</div>
	);
}

export default SummaryPanel;
