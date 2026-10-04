import React, { useRef, useState, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Play, History, TerminalSquare, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { SchemaSnapshot } from '../lib/types';

interface EditorPanelProps {
  initialSql: string;
  schema: SchemaSnapshot | null;
  onRun: (sql: string) => void;
  lastExecutionStatus: { success: boolean; msg: string; time: number } | null;
  rowsForExport: any[] | null;
  columnsForExport: string[] | null;
}

export default function EditorPanel({ initialSql, schema, onRun, lastExecutionStatus, rowsForExport, columnsForExport }: EditorPanelProps) {
  const editorRef = useRef<any>(null);
  const [editorValue, setEditorValue] = useState(initialSql);
  const schemaRef = useRef(schema);

  useEffect(() => {
    schemaRef.current = schema;
  }, [schema]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun(editor.getValue());
    });
  };

  const handleExportCSV = () => {
    if (!rowsForExport || !columnsForExport || rowsForExport.length === 0) return;
    const csvContent = [
      columnsForExport.join(','),
      ...rowsForExport.map(row => row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <TerminalSquare size={18} className="text-gray-500" />
          <span className="font-semibold text-sm">SQL console</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <History size={14} /> History
          </button>
          <button 
            onClick={() => editorRef.current && onRun(editorRef.current.getValue())}
            className="text-xs flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Play size={14} fill="currentColor" /> Run <span className="opacity-70 font-normal">Ctrl+Enter</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={editorValue}
          onChange={(val) => setEditorValue(val || '')}
          onMount={handleEditorDidMount}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'monospace',
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 16 }
          }}
        />
      </div>

      {lastExecutionStatus && (
        <div className={`px-4 py-1.5 flex justify-between items-center text-xs font-medium border-y dark:border-gray-800 ${lastExecutionStatus.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/50' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/50'}`}>
          <div className="flex items-center gap-2">
            {lastExecutionStatus.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{lastExecutionStatus.msg} · {lastExecutionStatus.time} ms</span>
          </div>
          {lastExecutionStatus.success && rowsForExport && rowsForExport.length > 0 && (
            <button onClick={handleExportCSV} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      )}
    </div>
  );
}
