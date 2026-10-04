import React, { useState, useEffect } from 'react';
import { Database } from 'sql.js';
import { SchemaSnapshot } from '../lib/types';
import { Plus } from 'lucide-react';

interface DataGridPanelProps {
  db: Database;
  schema: SchemaSnapshot | null;
  role: 'admin' | 'user';
  onExecuteQuery: (sql: string) => void;
  onDataLoaded: (rows: any[], cols: string[]) => void;
}

export default function DataGridPanel({ db, schema, role, onExecuteQuery, onDataLoaded }: DataGridPanelProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{rowIdx: number, colIdx: number, val: string} | null>(null);

  useEffect(() => {
    if (schema && schema.tables.length > 0) {
      if (!selectedTable || !schema.tables.find(t => t.name === selectedTable)) {
        setSelectedTable(schema.tables[0].name);
      }
    } else {
      setSelectedTable(null);
      setRows([]);
      setColumns([]);
      onDataLoaded([], []);
    }
  }, [schema, selectedTable]);

  useEffect(() => {
    if (!selectedTable) return;
    try {
      const result = db.exec(`SELECT * FROM "${selectedTable}" LIMIT 100`);
      if (result.length > 0) {
        setColumns(result[0].columns);
        setRows(result[0].values);
        onDataLoaded(result[0].values, result[0].columns);
      } else {
        const tableSchema = schema?.tables.find(t => t.name === selectedTable);
        const cols = tableSchema ? tableSchema.columns.map(c => c.name) : [];
        setColumns(cols);
        setRows([]);
        onDataLoaded([], cols);
      }
    } catch (err: any) {
      // errors handled by top level
      setRows([]);
      setColumns([]);
      onDataLoaded([], []);
    }
  }, [db, selectedTable, schema]); 

  const handleCellDoubleClick = (rowIdx: number, colIdx: number, val: any) => {
    if (role !== 'admin') return;
    setEditingCell({ rowIdx, colIdx, val: val === null ? '' : String(val) });
  };

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number) => {
    if (e.key === 'Escape') {
      setEditingCell(null);
    } else if (e.key === 'Enter') {
      if (!selectedTable || !schema) return;
      const tableSchema = schema.tables.find(t => t.name === selectedTable);
      if (!tableSchema) return;

      const pkCol = tableSchema.columns.find(c => c.pk);
      if (!pkCol) {
        alert("Cannot update row: No Primary Key found for this table.");
        setEditingCell(null);
        return;
      }

      const pkIdx = columns.indexOf(pkCol.name);
      const pkValue = rows[rowIdx][pkIdx];
      const targetColumn = columns[colIdx];
      const newValue = editingCell?.val || '';

      const isNumeric = tableSchema.columns.find(c => c.name === targetColumn)?.type.toUpperCase().includes('INT') 
                        || tableSchema.columns.find(c => c.name === targetColumn)?.type.toUpperCase().includes('REAL');
      
      const formattedValue = isNumeric && newValue !== '' ? newValue : `'${newValue.replace(/'/g, "''")}'`;
      const formattedPk = typeof pkValue === 'number' ? pkValue : `'${pkValue}'`;

      const sql = `UPDATE "${selectedTable}" SET "${targetColumn}" = ${formattedValue} WHERE "${pkCol.name}" = ${formattedPk};`;
      onExecuteQuery(sql);
      setEditingCell(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l dark:border-gray-800">
      
      {/* Tabs */}
      <div className="flex items-center px-4 pt-2 border-b dark:border-gray-800 gap-6 relative">
        {schema?.tables.map(t => (
          <button
            key={t.name}
            onClick={() => setSelectedTable(t.name)}
            className={`pb-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${selectedTable === t.name ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <span className="opacity-70">⊞</span> {t.name}
          </button>
        ))}
        {schema?.tables.length === 0 && <span className="pb-2 text-sm text-gray-400">No tables</span>}
        
        {role === 'admin' && (
          <div className="ml-auto pb-2">
            <span className="text-[10px] bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/50 uppercase tracking-wider font-semibold">Admin edit mode</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.1)]">
            <tr>
              <th className="px-3 py-2 text-gray-400 font-normal w-12 text-center border-r dark:border-gray-800">#</th>
              {columns.map(col => (
                <th key={col} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b dark:border-gray-800 ${i % 2 === 1 ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
                <td className="px-3 py-2 text-gray-400 text-center border-r dark:border-gray-800 select-none">{i + 1}</td>
                {row.map((cell: any, j: number) => (
                  <td 
                    key={j} 
                    className="px-4 py-1.5 max-w-[200px]"
                    onDoubleClick={() => handleCellDoubleClick(i, j, cell)}
                  >
                    {editingCell?.rowIdx === i && editingCell?.colIdx === j ? (
                      <input
                        autoFocus
                        className="w-full bg-white dark:bg-gray-950 border-2 border-indigo-500 rounded px-2 py-1 outline-none text-gray-900 dark:text-gray-100 shadow-sm"
                        value={editingCell.val}
                        onChange={e => setEditingCell({...editingCell, val: e.target.value})}
                        onKeyDown={e => handleCellKeyDown(e, i, j)}
                        onBlur={() => setEditingCell(null)}
                      />
                    ) : (
                      <div className="truncate text-gray-700 dark:text-gray-300" title={String(cell)}>
                         {cell !== null ? String(cell) : <span className="text-gray-400 italic">NULL</span>}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {selectedTable && (
          <div className="p-4">
            <button className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              <Plus size={14} /> Add row
            </button>
          </div>
        )}
      </div>

      {/* Grid Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t dark:border-gray-800 text-xs text-gray-500 bg-white dark:bg-gray-900">
        <span>{rows.length} rows</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
