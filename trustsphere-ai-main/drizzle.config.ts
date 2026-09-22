import { defineConfig } from "drizzle-kit";

// Used by `bun run db:generate` / `db:push` / `db:studio`. Reads the same
// connection details as the app itself (see src/db/client.ts).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env["DATABASE_URL"] ?? "",
  },
});
