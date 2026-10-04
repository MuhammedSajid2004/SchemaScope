import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import TableNode from './TableNode';
import { SchemaSnapshot } from '../lib/types';

const nodeTypes = {
  table: TableNode,
};

interface CanvasPanelProps {
  schema: SchemaSnapshot | null;
}

export default function CanvasPanel({ schema }: CanvasPanelProps) {
  const { nodes, edges } = useMemo(() => {
    if (!schema) return { nodes: [], edges: [] };

    let currentX = 50;
    const initialNodes: Node[] = schema.tables.map((table, i) => {
      const x = currentX;
      currentX += 320;
      return {
        id: table.name,
        type: 'table',
        position: { x, y: 50 + (i % 2) * 150 },
        data: { table },
      };
    });

    const initialEdges: Edge[] = [];
    
    schema.tables.forEach((table) => {
      table.foreignKeys.forEach((fk) => {
        initialEdges.push({
          id: `e-${table.name}-${fk.from}-${fk.table}-${fk.to}`,
          source: table.name,
          target: fk.table,
          sourceHandle: `source-${fk.from}`,
          targetHandle: `target-${fk.to}`,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6366f1'
          },
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5,5' }
        });
      });
    });

    return { nodes: initialNodes, edges: initialEdges };
  }, [schema]);

  return (
    <div className="h-full w-full bg-[#0d1117] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={24} size={1} color="#2d3748" />
        <Controls className="bg-[#1e1e2d] border-none fill-gray-300" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }} />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-[#1e1e2d] border border-[#2d2d44] rounded-md px-4 py-2 flex gap-4 text-xs text-gray-300 shadow-lg">
        <div className="flex items-center gap-1.5"><span className="text-yellow-500">□</span> Primary</div>
        <div className="flex items-center gap-1.5"><span className="text-blue-400">□</span> Foreign</div>
      </div>
    </div>
  );
}
