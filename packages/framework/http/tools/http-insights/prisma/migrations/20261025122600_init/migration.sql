-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Controller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controller" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "error" JSONB,
    "error_traces" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Controller_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guard" TEXT NOT NULL,
    "allowed" BOOLEAN,
    "error" JSONB,
    "error_traces" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Guard_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HttpError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "error" JSONB NOT NULL,
    "error_traces" JSONB,
    "filter" TEXT,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "HttpError_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interceptor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interceptor" TEXT NOT NULL,
    "error" JSONB,
    "error_traces" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Interceptor_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Middleware" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "middleware" TEXT NOT NULL,
    "error" JSONB,
    "error_traces" JSONB,
    "phase" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Middleware_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NativeMiddleware" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "error" JSONB,
    "error_traces" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "NativeMiddleware_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipe" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "parameter_index" INTEGER NOT NULL,
    "error" JSONB,
    "error_traces" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "call_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Pipe_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Request" (
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

-- CreateTable
CREATE TABLE "Response" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Controller_call_id_key" ON "Controller"("call_id");

-- CreateIndex
CREATE INDEX "Guard_call_id_idx" ON "Guard"("call_id");

-- CreateIndex
CREATE INDEX "HttpError_call_id_idx" ON "HttpError"("call_id");

-- CreateIndex
CREATE INDEX "Interceptor_call_id_idx" ON "Interceptor"("call_id");

-- CreateIndex
CREATE INDEX "Middleware_call_id_idx" ON "Middleware"("call_id");

-- CreateIndex
CREATE INDEX "NativeMiddleware_call_id_idx" ON "NativeMiddleware"("call_id");

-- CreateIndex
CREATE INDEX "Pipe_call_id_idx" ON "Pipe"("call_id");

-- CreateIndex
CREATE UNIQUE INDEX "Request_call_id_key" ON "Request"("call_id");

-- CreateIndex
CREATE INDEX "Request_method_idx" ON "Request"("method");

-- CreateIndex
CREATE INDEX "Request_url_idx" ON "Request"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Response_call_id_key" ON "Response"("call_id");

-- CreateIndex
CREATE INDEX "Response_status_code_idx" ON "Response"("status_code");
