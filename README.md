SchemaScope

SchemaScope is a live SQL visualizer and professional database IDE built entirely for the browser. It allows you to write SQL, execute queries against an in-memory SQLite database, and watch your Entity-Relationship (ER) diagram generate and update in real time.

Designed for students, educators, and professionals, SchemaScope removes the friction of backend setups by running 100% locally in your browser using WebAssembly.

✨ Features
Live ER Diagram Visualizer: As you run CREATE TABLE and ALTER TABLE statements, the schema canvas automatically maps out your tables, columns, data types, and draws 1:N cardinality relationships for your Foreign Keys.
Robust SQL Console: A multi-line SQL editor powered by Monaco (the engine behind VS Code) with syntax highlighting, line numbers, and intelligent autocomplete for your specific database schema.
In-Browser SQLite Engine: Uses sql.js (SQLite compiled to WebAssembly) to run a real relational database locally, complete with strict referential integrity (PRAGMA foreign_keys = ON).
Interactive Data Grid: View the results of your SELECT queries or explore table contents through a clean, tabbed interface.
Admin Edit Mode (RBAC): Toggle between "User" and "Admin" roles. Admins can double-click any cell in the Data Grid to edit values directly, instantly executing UPDATE queries behind the scenes.
Export to CSV: One-click export of your query results directly to a .csv file.
Dark/Light Themes: Beautiful, professional IDE aesthetics matching industry standards like DataGrip and pgAdmin.
🛠️ Tech Stack
Framework: React 18 + Vite + TypeScript
Styling: Tailwind CSS
Code Editor: @monaco-editor/react
Database: sql.js (SQLite WASM)
Visualizer: reactflow
Icons: lucide-react
🚀 Getting Started
Prerequisites

Make sure you have Node.js
 installed on your machine.

Installation
Clone or download this repository
Navigate into the project directory:
bash
cd SchemaScope
Install the dependencies:
bash
npm install
Start the development server:
bash
npm run dev
Open your browser: Navigate to http://localhost:5173 (or the port Vite provides).
📖 Usage Guide
Write DDL: In the top-right SQL Console, type a standard SQLite CREATE TABLE statement. Ensure you define PRIMARY KEY and FOREIGN KEY constraints.
Run Code: Press the Run button or hit Ctrl + Enter. Watch the table instantly appear on the left schema canvas!
Insert Data: Write INSERT INTO... statements and run them.
View Data: Look at the bottom-right Data Grid. Click on your table's tab to see the inserted rows.
Export: Run a SELECT query, and click the Export CSV button in the green success bar to download your data.
Edit Data: Switch your role to Admin in the top-right header, double-click a cell in the Data Grid, type a new value, and press Enter to instantly update the database.
11:56 AM
