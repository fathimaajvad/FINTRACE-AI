import networkx as nx
from app.scoring import calculate_scores

def analyze_transactions(df):

    G = nx.DiGraph()

    for _, row in df.iterrows():
        G.add_edge(
            row["sender_id"],
            row["receiver_id"],
            amount=row["amount"],
            timestamp=row["timestamp"]
        )

    suspicious_accounts, fraud_rings = calculate_scores(G, df)

    result = {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings": fraud_rings,
        "summary": {
            "total_accounts_analyzed": len(G.nodes),
            "suspicious_accounts_flagged": len(suspicious_accounts),
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": 0
        }
    }

    return result
