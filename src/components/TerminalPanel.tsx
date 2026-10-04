import React, { useRef, useState, useEffect } from 'react';
import { Terminal as TerminalIcon, ShieldAlert } from 'lucide-react';
import { SchemaSnapshot } from '../lib/types';
import Editor, { OnMount } from '@monaco-editor/react';

interface TerminalPanelProps {
  schema: SchemaSnapshot | null;
  onRun: (sql: string) => void;
  logs: any[];
}

export default function TerminalPanel({ schema, onRun, logs }: TerminalPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);

  // Auto scroll to bottom of history
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Run on Enter
    editor.addCommand(monaco.KeyCode.Enter, () => {
      const val = editor.getValue();
      if (val.trim()) {
        onRun(val);
        editor.setValue('');
      }
    });

    // Run on Ctrl+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const val = editor.getValue();
      if (val.trim()) {
        onRun(val);
        editor.setValue('');
      }
    });

    // Autocomplete (Removed ' ' from trigger characters to fix spacebar bug)
    monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: ['.'],
      provideCompletionItems: () => {
        const suggestions: any[] = [];
        schema?.tables.forEach(table => {
          suggestions.push({
            label: table.name,
            kind: monaco.languages.CompletionItemKind.Struct,
            insertText: table.name,
            detail: 'Table'
          });
          table.columns.forEach(col => {
            suggestions.push({
              label: `${table.name}.${col.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col.name,
              detail: `Column in ${table.name}`
            });
            suggestions.push({
              label: col.name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col.name,
              detail: `Column`
            });
          });
        });
        return { suggestions };
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center p-3 border-b bg-card">
        <TerminalIcon size={16} className="text-primary mr-2" />
        <span className="font-semibold text-sm tracking-wide">SQL Console</span>
        <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">Press Enter to execute</span>
      </div>
      
      {/* Terminal Input (Moved to Top) */}
      <div className="border-b h-40 relative bg-background shadow-sm z-10">
        <div className="absolute top-3 left-3 text-primary font-mono text-sm select-none z-10">
          sql&gt;
        </div>
        <div className="h-full pl-10 pt-3 pb-2">
          <Editor
            height="100%"
            defaultLanguage="sql"
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'off',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
              fontSize: 14,
              fontFamily: 'monospace',
              wordWrap: 'on',
              suggestOnTriggerCharacters: true,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: { vertical: 'hidden' }
            }}
          />
        </div>
      </div>

      {/* Terminal History */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-4 bg-muted/10">
        {logs.length === 0 && (
          <div className="text-muted-foreground">
            Welcome to SchemaScope. Type your SQL query above and press Enter.
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="space-y-1">
            <div className="flex gap-2 text-primary">
              <span className="select-none opacity-50">sql&gt;</span>
              <span className="whitespace-pre-wrap font-medium">{log.sql}</span>
            </div>
            {log.error ? (
              <div className="text-destructive flex items-start gap-1.5 bg-destructive/5 p-2 rounded border border-destructive/10">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                <span className="leading-tight">{log.error}</span>
              </div>
            ) : (
              <div className="text-muted-foreground text-xs pl-8">
                Query executed successfully.
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
