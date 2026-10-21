-- RenameTable
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

ALTER TABLE "Execution" RENAME TO "Call";

-- RedefineTables
CREATE TABLE "new_Controller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controller" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Controller_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Controller" ("call_id", "controller", "created_at", "ended_at", "error", "id", "method", "started_at", "updated_at") SELECT "execution_id", "controller", "created_at", "ended_at", "error", "id", "method", "started_at", "updated_at" FROM "Controller";
DROP TABLE "Controller";
ALTER TABLE "new_Controller" RENAME TO "Controller";
CREATE UNIQUE INDEX "Controller_call_id_key" ON "Controller"("call_id");

CREATE TABLE "new_Guard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guard" TEXT NOT NULL,
    "allowed" BOOLEAN,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Guard_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Guard" ("allowed", "call_id", "created_at", "ended_at", "error", "guard", "id", "started_at", "updated_at") SELECT "allowed", "execution_id", "created_at", "ended_at", "error", "guard", "id", "started_at", "updated_at" FROM "Guard";
DROP TABLE "Guard";
ALTER TABLE "new_Guard" RENAME TO "Guard";
CREATE INDEX "Guard_call_id_idx" ON "Guard"("call_id");

CREATE TABLE "new_HttpError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "error" JSONB NOT NULL,
    "filter" TEXT,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "HttpError_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HttpError" ("call_id", "created_at", "ended_at", "error", "filter", "id", "started_at", "updated_at") SELECT "execution_id", "created_at", "ended_at", "error", "filter", "id", "started_at", "updated_at" FROM "HttpError";
DROP TABLE "HttpError";
ALTER TABLE "new_HttpError" RENAME TO "HttpError";
CREATE INDEX "HttpError_call_id_idx" ON "HttpError"("call_id");

CREATE TABLE "new_Interceptor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interceptor" TEXT NOT NULL,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Interceptor_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interceptor" ("call_id", "created_at", "ended_at", "error", "id", "interceptor", "started_at", "updated_at") SELECT "execution_id", "created_at", "ended_at", "error", "id", "interceptor", "started_at", "updated_at" FROM "Interceptor";
DROP TABLE "Interceptor";
ALTER TABLE "new_Interceptor" RENAME TO "Interceptor";
CREATE INDEX "Interceptor_call_id_idx" ON "Interceptor"("call_id");

CREATE TABLE "new_Middleware" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "middleware" TEXT NOT NULL,
    "error" JSONB,
    "phase" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Middleware_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Middleware" ("call_id", "created_at", "ended_at", "error", "id", "middleware", "phase", "started_at", "updated_at") SELECT "execution_id", "created_at", "ended_at", "error", "id", "middleware", "phase", "started_at", "updated_at" FROM "Middleware";
DROP TABLE "Middleware";
ALTER TABLE "new_Middleware" RENAME TO "Middleware";
CREATE INDEX "Middleware_call_id_idx" ON "Middleware"("call_id");

CREATE TABLE "new_NativeMiddleware" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "NativeMiddleware_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NativeMiddleware" ("call_id", "created_at", "ended_at", "error", "id", "name", "started_at", "updated_at") SELECT "execution_id", "created_at", "ended_at", "error", "id", "name", "started_at", "updated_at" FROM "NativeMiddleware";
DROP TABLE "NativeMiddleware";
ALTER TABLE "new_NativeMiddleware" RENAME TO "NativeMiddleware";
CREATE INDEX "NativeMiddleware_call_id_idx" ON "NativeMiddleware"("call_id");

CREATE TABLE "new_Pipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipe" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "parameter_index" INTEGER NOT NULL,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Pipe_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pipe" ("call_id", "created_at", "ended_at", "error", "id", "method", "parameter_index", "pipe", "started_at", "updated_at") SELECT "execution_id", "created_at", "ended_at", "error", "id", "method", "parameter_index", "pipe", "started_at", "updated_at" FROM "Pipe";
DROP TABLE "Pipe";
ALTER TABLE "new_Pipe" RENAME TO "Pipe";
CREATE INDEX "Pipe_call_id_idx" ON "Pipe"("call_id");

CREATE TABLE "new_Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headers" JSONB NOT NULL,
    "method" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL,
    "url" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Request_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("call_id", "created_at", "headers", "id", "method", "started_at", "updated_at", "url") SELECT "execution_id", "created_at", "headers", "id", "method", "started_at", "updated_at", "url" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
CREATE UNIQUE INDEX "Request_call_id_key" ON "Request"("call_id");
CREATE INDEX "Request_method_idx" ON "Request"("method");
CREATE INDEX "Request_url_idx" ON "Request"("url");

CREATE TABLE "new_Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aborted" BOOLEAN NOT NULL,
    "headers" JSONB NOT NULL,
    "sent_at" DATETIME NOT NULL,
    "status_code" INTEGER NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Response_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Response" ("aborted", "call_id", "created_at", "headers", "id", "sent_at", "status_code", "updated_at") SELECT "aborted", "execution_id", "created_at", "headers", "id", "sent_at", "status_code", "updated_at" FROM "Response";
DROP TABLE "Response";
ALTER TABLE "new_Response" RENAME TO "Response";
CREATE UNIQUE INDEX "Response_call_id_key" ON "Response"("call_id");
CREATE INDEX "Response_status_code_idx" ON "Response"("status_code");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
