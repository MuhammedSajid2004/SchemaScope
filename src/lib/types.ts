export interface Column {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: any;
  pk: boolean;
  unique: boolean;
}

export interface ForeignKey {
  id: number;
  seq: number;
  table: string;
  from: string;
  to: string;
  on_update: string;
  on_delete: string;
  match: string;
}

export interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
}

export interface SchemaSnapshot {
  tables: Table[];
}

export interface LogEntry {
  id: string;
  sql: string;
  timestamp: number;
  success: boolean;
  error?: string;
}
