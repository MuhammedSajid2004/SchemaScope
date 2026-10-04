import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { Table, Column, ForeignKey, SchemaSnapshot } from './types';

// ==========================================
// DBMS Concept: Database Engine & Connection
// ==========================================
// This module acts as our Relational Database Management System (RDBMS) engine.
// We are using SQLite compiled to WebAssembly (sql.js) to run entirely in the browser.
// Turning on PRAGMA foreign_keys enforces Referential Integrity, a key DBMS concept
// ensuring that relationships between tables remain consistent.
let SQL: SqlJsStatic | null = null;

export async function initDb(): Promise<Database> {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: () => sqlWasmUrl
    });
  }
  const db = new SQL.Database();

  // Enforce foreign key constraints (Referential Integrity)
  db.run("PRAGMA foreign_keys = ON;");
  return db;
}

// ==========================================
// DBMS Concept: Data Dictionary / System Catalog
// ==========================================
// In a DBMS, the system catalog (or information schema) stores metadata about the 
// database itself (tables, columns, data types, constraints).
// Here we query SQLite's internal catalog tables (sqlite_master, PRAGMA table_info, etc.)
// to extract the schema structure and visualize the conceptual schema.
export function extractSchema(db: Database): SchemaSnapshot {
  const tables: Table[] = [];

  
  // Get all tables
  const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  if (result.length === 0) return { tables };

  const tableNames = result[0].values.map(row => row[0] as string);

  for (const tableName of tableNames) {
    // Get columns
    const columnsResult = db.exec(`PRAGMA table_info("${tableName}")`);
    const columns: Column[] = [];
    
    // Get indices for uniqueness
    const indexResult = db.exec(`PRAGMA index_list("${tableName}")`);
    const uniqueColumns = new Set<string>();
    
    if (indexResult.length > 0) {
      for (const idxRow of indexResult[0].values) {
        if (idxRow[2] === 1) { // unique index
          const idxInfo = db.exec(`PRAGMA index_info("${idxRow[1]}")`);
          if (idxInfo.length > 0) {
            for (const infoRow of idxInfo[0].values) {
              uniqueColumns.add(infoRow[2] as string);
            }
          }
        }
      }
    }

    if (columnsResult.length > 0) {
      for (const row of columnsResult[0].values) {
        columns.push({
          cid: row[0] as number,
          name: row[1] as string,
          type: row[2] as string,
          notnull: (row[3] as number) === 1,
          dflt_value: row[4],
          pk: (row[5] as number) > 0,
          unique: uniqueColumns.has(row[1] as string)
        });
      }
    }

    // Get foreign keys
    const fkResult = db.exec(`PRAGMA foreign_key_list("${tableName}")`);
    const foreignKeys: ForeignKey[] = [];
    if (fkResult.length > 0) {
      for (const row of fkResult[0].values) {
        foreignKeys.push({
          id: row[0] as number,
          seq: row[1] as number,
          table: row[2] as string,
          from: row[3] as string,
          to: row[4] as string,
          on_update: row[5] as string,
          on_delete: row[6] as string,
          match: row[7] as string,
        });
      }
    }

    tables.push({
      name: tableName,
      columns,
      foreignKeys,
    });
  }

  return { tables };
}
