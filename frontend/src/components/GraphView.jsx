import ForceGraph2D from "react-force-graph-2d";

const GraphView = ({ transactions, data }) => {
  const transactionList = Array.isArray(transactions)
    ? transactions
    : Array.isArray(data?.transactions)
      ? data.transactions
      : [];

  const buildGraph = () => {
    const nodesMap = {};
    const links = [];

    transactionList.forEach((tx) => {
      const sender = tx.sender;
      const receiver = tx.receiver;

      if (!sender || !receiver) {
        return;
      }

      if (!nodesMap[sender]) {
        nodesMap[sender] = {
          id: sender,
          suspicious: false
        };
      }

      if (!nodesMap[receiver]) {
        nodesMap[receiver] = {
          id: receiver,
          suspicious: false
        };
      }

      if (tx.flagged === true) {
        nodesMap[sender].suspicious = true;
        nodesMap[receiver].suspicious = true;
      }

      links.push({
        source: sender,
        target: receiver,
        amount: tx.amount
      });
    });

    return {
      nodes: Object.values(nodesMap),
      links: links
    };
  };

  const graphData = buildGraph();

  if (!graphData.nodes.length) {
    return <p className="m-0 text-slate-500">No transaction graph data available.</p>;
  }

  return (
    <div className="h-[600px] rounded-lg border border-slate-300">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="id"

        nodeColor={(node) =>
          node.suspicious ? "red" : "green"
        }

        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.2}

        linkLabel={(link) => `₹${link.amount}`}

        onNodeClick={(node) =>
          alert(`Account: ${node.id}`)
        }
      />
    </div>
  );
};

export default GraphView;
