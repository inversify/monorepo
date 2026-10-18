-- CreateTable
CREATE TABLE "Execution" (
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
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Controller_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guard" TEXT NOT NULL,
    "allowed" BOOLEAN,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Guard_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HttpError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "error" JSONB NOT NULL,
    "filter" TEXT,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "HttpError_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interceptor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "interceptor" TEXT NOT NULL,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Interceptor_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Middleware" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "middleware" TEXT NOT NULL,
    "error" JSONB,
    "phase" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Middleware_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NativeMiddleware" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "NativeMiddleware_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipe" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "parameter_index" INTEGER NOT NULL,
    "error" JSONB,
    "started_at" DATETIME NOT NULL,
    "ended_at" DATETIME NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Pipe_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headers" JSONB NOT NULL,
    "method" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL,
    "url" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Request_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aborted" BOOLEAN NOT NULL,
    "headers" JSONB NOT NULL,
    "sent_at" DATETIME NOT NULL,
    "status_code" INTEGER NOT NULL,
    "execution_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Response_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "Execution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Controller_execution_id_key" ON "Controller"("execution_id");

-- CreateIndex
CREATE INDEX "Guard_execution_id_idx" ON "Guard"("execution_id");

-- CreateIndex
CREATE INDEX "HttpError_execution_id_idx" ON "HttpError"("execution_id");

-- CreateIndex
CREATE INDEX "Interceptor_execution_id_idx" ON "Interceptor"("execution_id");

-- CreateIndex
CREATE INDEX "Middleware_execution_id_idx" ON "Middleware"("execution_id");

-- CreateIndex
CREATE INDEX "NativeMiddleware_execution_id_idx" ON "NativeMiddleware"("execution_id");

-- CreateIndex
CREATE INDEX "Pipe_execution_id_idx" ON "Pipe"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "Request_execution_id_key" ON "Request"("execution_id");

-- CreateIndex
CREATE INDEX "Request_method_idx" ON "Request"("method");

-- CreateIndex
CREATE INDEX "Request_url_idx" ON "Request"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Response_execution_id_key" ON "Response"("execution_id");

-- CreateIndex
CREATE INDEX "Response_status_code_idx" ON "Response"("status_code");
