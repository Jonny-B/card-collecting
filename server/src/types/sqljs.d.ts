declare module 'sql.js' {
  export type SqlJsStatic = {
    Database: new (data?: Uint8Array) => Database;
  };

  export class Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export class Statement {
    bind(params?: any[]): void;
    step(): boolean;
    getAsObject<T = any>(): T;
    free(): void;
  }

  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
  export { Database };
}
