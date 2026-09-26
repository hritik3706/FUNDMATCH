declare module "embedded-postgres" {
  export default class EmbeddedPostgres {
    constructor(options: {
      databaseDir: string;
      user: string;
      password: string;
      port: number;
      persistent: boolean;
    });
    initialise(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    createDatabase(name: string): Promise<void>;
  }
}
