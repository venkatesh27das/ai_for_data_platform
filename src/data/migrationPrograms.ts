import type { Status } from "./capabilities";

export type MigrationProgram = {
  name: string;
  source: string;
  target: string;
  owner: string;
  status: Status;
  progress: number;
  assets: number;
  converted: number;
  validationScore: number | null;
};

export const migrationPrograms: MigrationProgram[] = [
  { name: "Teradata to Databricks Modernization", source: "Teradata", target: "Databricks", owner: "Vikram Patel", status: "In Progress", progress: 62, assets: 36, converted: 128, validationScore: 88 },
  { name: "Legacy SQL Server to Snowflake Migration", source: "SQL Server", target: "Snowflake", owner: "Riya Menon", status: "Assessment", progress: 28, assets: 28, converted: 42, validationScore: null },
  { name: "Informatica ETL to PySpark Conversion", source: "Informatica", target: "PySpark", owner: "Arjun Rao", status: "Validation", progress: 71, assets: 22, converted: 67, validationScore: 82 },
  { name: "Oracle Warehouse to Lakehouse Program", source: "Oracle", target: "Lakehouse", owner: "Neha Singh", status: "In Progress", progress: 55, assets: 34, converted: 101, validationScore: 75 },
  { name: "SAS to Python Analytics Migration", source: "SAS", target: "Python", owner: "Sneha Iyer", status: "Completed", progress: 100, assets: 28, converted: 89, validationScore: 96 }
];
