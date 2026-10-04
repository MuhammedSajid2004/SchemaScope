import React, { useEffect, useState } from 'react';
import EditorPanel from './components/EditorPanel';
import CanvasPanel from './components/CanvasPanel';
import DataGridPanel from './components/DataGridPanel';
import { initDb, extractSchema } from './lib/db';
import { Database } from 'sql.js';
import { SchemaSnapshot, LogEntry } from './lib/types';
import { Table as TableIcon, LayoutGrid } from 'lucide-react';

function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [schema, setSchema] = useState<SchemaSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [lastExecutionStatus, setLastExecutionStatus] = useState<{success: boolean; msg: string; time: number} | null>(null);
  const [rowsForExport, setRowsForExport] = useState<any[]>([]);
  const [columnsForExport, setColumnsForExport] = useState<string[]>([]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    initDb().then((database) => {
      setDb(database);
      setSchema(extractSchema(database));
    }).catch(err => {
      console.error("Failed to initialize DB:", err);
      setError("Failed to load SQL.js engine.");
    });
  }, []);

  const handleRun = (currentSql: string) => {
    if (!db || !currentSql.trim()) return;
    
    setError(null);
    const start = performance.now();
    try {
      db.run(currentSql);
      const time = Math.round(performance.now() - start);
      
      const newSchema = extractSchema(db);
      setSchema(newSchema);
      setLastExecutionStatus({ success: true, msg: 'Query executed successfully', time });
      
    } catch (err: any) {
      const time = Math.round(performance.now() - start);
      setLastExecutionStatus({ success: false, msg: err.message, time });
    }
  };

  const handleDataLoaded = (rows: any[], cols: string[]) => {
    setRowsForExport(rows);
    setColumnsForExport(cols);
    if (lastExecutionStatus?.success) {
      setLastExecutionStatus({ ...lastExecutionStatus, msg: `Query ran · ${rows.length} rows` });
    }
  };

  if (error && !db) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-red-500 font-bold text-xl mb-4">Initialization Error</div>
        <div className="bg-red-500/10 p-4 rounded text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (!db) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading Database Engine...</div>;
  }

  const relationCount = schema?.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0) || 0;

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-[#0d1117] text-white font-sans`}>
      {/* Header */}
      <header className="h-14 border-b border-[#2d2d44] flex items-center px-4 justify-between bg-[#161b22]">
        <div className="flex items-center gap-6">
          <h1 className="font-semibold text-lg flex items-center gap-2 tracking-wide">
            <div className="bg-indigo-600 p-1.5 rounded-md">
              <TableIcon size={16} className="text-white" />
            </div>
            SchemaScope
          </h1>
          <div className="flex items-center gap-2 text-sm bg-[#0d1117] border border-[#2d2d44] px-3 py-1.5 rounded-md text-gray-300">
            <span>□</span> university.db <span>▾</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setRole(role === 'admin' ? 'user' : 'admin')}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border transition-colors ${role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-transparent text-gray-400 border-[#2d2d44]'}`}
          >
            <span>□</span> {role === 'admin' ? 'Admin' : 'User'}
          </button>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-[#2d2d44] text-gray-300 hover:bg-white/5 transition-colors"
          >
            <span>□</span> {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold ml-2">
            AD
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Canvas Visualizer */}
        <div className="flex-1 relative z-0 flex flex-col">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2 bg-[#1e1e2d] border border-[#2d2d44] px-3 py-1.5 rounded-md">
              <LayoutGrid size={14} /> Schema view
            </div>
            <span>{schema?.tables.length || 0} tables · {relationCount} relation{relationCount !== 1 ? 's' : ''}</span>
          </div>
          <CanvasPanel schema={schema} />
        </div>
        
        {/* Right Column: Console & Data Grid */}
        <div className="w-[50%] min-w-[500px] flex flex-col z-10 border-l border-[#2d2d44]">
          {/* Top Right: SQL Editor */}
          <div className="flex-1 flex flex-col">
            <EditorPanel 
              initialSql={"SELECT s.name, c.title, c.credits\nFROM student s\nJOIN course c ON c.id = s.course_id\nWHERE s.age > 18;"} 
              schema={schema}
              onRun={handleRun}
              lastExecutionStatus={lastExecutionStatus}
              rowsForExport={rowsForExport}
              columnsForExport={columnsForExport}
            />
          </div>

          {/* Bottom Right: Data Grid */}
          <div className="h-[45%] flex flex-col border-t dark:border-gray-800 bg-white dark:bg-gray-900">
            <DataGridPanel 
              db={db} 
              schema={schema} 
              role={role}
              onExecuteQuery={handleRun} 
              onDataLoaded={handleDataLoaded}
            />
          </div>
        </div>
        
      </div>

      {/* Global Footer */}
      <footer className="h-8 border-t border-[#2d2d44] bg-[#0d1117] flex items-center justify-between px-4 text-xs text-gray-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Connected
          </div>
          <div>SQLite</div>
          <div>{schema?.tables.length || 0} tables</div>
        </div>
        <div>
          {role === 'admin' ? 'Admin · read and write' : 'User · read only'}
        </div>
      </footer>
    </div>
  );
}

export default App;
