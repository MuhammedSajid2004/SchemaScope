import { Handle, Position } from 'reactflow';
import { Table } from '../lib/types';
import { Tooltip } from 'react-tooltip';

interface TableNodeProps {
  data: {
    table: Table;
  };
}

const colors = [
  'bg-indigo-700',
  'bg-teal-700',
  'bg-purple-700',
  'bg-pink-700',
  'bg-rose-700',
];

export default function TableNode({ data }: TableNodeProps) {
  const { table } = data;
  
  // Predictable color based on table name length/chars
  const colorIndex = table.name.length % colors.length;
  const headerColor = colors[colorIndex];

  return (
    <div className="bg-[#1e1e2d] text-gray-200 border border-[#2d2d44] rounded-lg shadow-xl w-64 text-sm font-sans overflow-hidden">
      <div className={`${headerColor} px-3 py-2 font-medium flex items-center gap-2`}>
        <span className="opacity-70">⊞</span>
        <span data-tooltip-id={`tt-table-${table.name}`} className="cursor-help tracking-wide">
          {table.name}
        </span>
      </div>
      
      <Tooltip id={`tt-table-${table.name}`} place="top" className="z-50">
        <div className="text-xs">
          <div><strong>Table:</strong> {table.name}</div>
          <div><strong>Columns:</strong> {table.columns.length}</div>
        </div>
      </Tooltip>

      <div className="flex flex-col py-1">
        {table.columns.map((col) => {
          const isFk = table.foreignKeys.some(fk => fk.from === col.name);
          
          return (
            <div 
              key={col.name} 
              className="relative px-3 py-1.5 flex items-center justify-between hover:bg-white/5"
              data-tooltip-id={`tt-col-${table.name}-${col.name}`}
            >
              <Handle 
                type="target" 
                position={Position.Left} 
                id={`target-${col.name}`} 
                style={{ top: '50%', left: -4, background: '#888', border: 'none' }}
              />

              <div className="flex items-center gap-2 overflow-hidden flex-1">
                {col.pk ? (
                  <span className="text-yellow-500 text-xs" title="Primary Key">□</span>
                ) : isFk ? (
                  <span className="text-blue-400 text-xs" title="Foreign Key">□</span>
                ) : (
                  <span className="w-3" />
                )}
                <span className="font-medium truncate" title={col.name}>{col.name}</span>
              </div>
              
              <div className="text-xs text-gray-500 font-mono">
                {col.type}
              </div>

              <Handle 
                type="source" 
                position={Position.Right} 
                id={`source-${col.name}`}
                style={{ top: '50%', right: -4, background: '#888', border: 'none' }}
              />
              
              <Tooltip id={`tt-col-${table.name}-${col.name}`} place="right" className="z-50">
                <div className="text-xs max-w-[200px]">
                  <div><strong>{col.name}</strong> ({col.type})</div>
                  {col.pk && <div>• Primary Key</div>}
                  {isFk && <div>• Foreign Key</div>}
                  {col.unique && <div>• Unique Constraint</div>}
                  {col.notnull && <div>• Not Null Constraint</div>}
                  {col.dflt_value !== null && <div>• Default: {col.dflt_value}</div>}
                </div>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
