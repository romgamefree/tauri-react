export type SqlServerConnection = {
  host: string;
  port: number;
  database: string;
  username: string;
  trustServerCertificate: boolean;
};

export type SqlServerInput = SqlServerConnection & { password: string };

export type SavedSqlServerConnection = {
  settings: SqlServerConnection | null;
  hasPassword: boolean;
};
