import path from "path";

type EmbeddedPostgresInstance = {
  initialise: () => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  createDatabase: (name: string) => Promise<void>;
};

type EmbeddedPostgresConstructor = new (options: {
  databaseDir: string;
  user: string;
  password: string;
  port: number;
  persistent: boolean;
}) => EmbeddedPostgresInstance;

const port = Number(process.env.LOCAL_PG_PORT ?? 5432);
const password = process.env.LOCAL_PG_PASSWORD ?? "postgres";
const user = process.env.LOCAL_PG_USER ?? "postgres";

async function createServer(): Promise<EmbeddedPostgresInstance> {
  const specifier = "embedded-postgres";
  const imported = (await import(specifier)) as {
    default: EmbeddedPostgresConstructor;
  };
  return new imported.default({
    databaseDir: path.resolve(__dirname, "../../data/pg"),
    user,
    password,
    port,
    persistent: true,
  });
}

async function main(): Promise<void> {
  const pg = await createServer();

  try {
    await pg.initialise();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already|exists/i.test(message)) {
      throw error;
    }
  }

  await pg.start();

  try {
    await pg.createDatabase("fundmatch_ai");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already exists/i.test(message)) {
      throw error;
    }
  }

  console.log(
    `Local Postgres is ready at postgresql://${user}:${password}@localhost:${port}/fundmatch_ai`,
  );

  const shutdown = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
