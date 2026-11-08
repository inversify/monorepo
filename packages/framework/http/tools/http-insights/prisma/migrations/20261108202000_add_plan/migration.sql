-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "controller_id" TEXT,
    "guard_id" TEXT,
    "interceptor_id" TEXT,
    "middleware_id" TEXT,
    "pipe_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Plan_controller_id_fkey" FOREIGN KEY ("controller_id") REFERENCES "Controller" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Plan_guard_id_fkey" FOREIGN KEY ("guard_id") REFERENCES "Guard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Plan_interceptor_id_fkey" FOREIGN KEY ("interceptor_id") REFERENCES "Interceptor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Plan_middleware_id_fkey" FOREIGN KEY ("middleware_id") REFERENCES "Middleware" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Plan_pipe_id_fkey" FOREIGN KEY ("pipe_id") REFERENCES "Pipe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plan_id" TEXT NOT NULL,
    "is_root" BOOLEAN NOT NULL,
    "is_multiple" BOOLEAN NOT NULL,
    "chained" BOOLEAN,
    "optional" BOOLEAN NOT NULL,
    "name_kind" TEXT,
    "name_value" TEXT,
    "service_identifier_kind" TEXT NOT NULL,
    "service_identifier_value" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PlanService_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanServiceTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "key_kind" TEXT NOT NULL,
    "key_value" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PlanServiceTag_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "PlanService" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanBinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plan_id" TEXT NOT NULL,
    "binding_identifier" INTEGER NOT NULL,
    "module_id" INTEGER,
    "type" TEXT NOT NULL,
    "scope" TEXT,
    "service_identifier_kind" TEXT NOT NULL,
    "service_identifier_value" TEXT NOT NULL,
    "implementation_type_kind" TEXT,
    "implementation_type_value" TEXT,
    "target_service_identifier_kind" TEXT,
    "target_service_identifier_value" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PlanBinding_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanServiceBinding" (
    "service_id" TEXT NOT NULL,
    "binding_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    PRIMARY KEY ("service_id", "position"),
    CONSTRAINT "PlanServiceBinding_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "PlanService" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlanServiceBinding_binding_id_fkey" FOREIGN KEY ("binding_id") REFERENCES "PlanBinding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanBindingDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "binding_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "key_kind" TEXT,
    "key_value" TEXT,
    "service_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "PlanBindingDependency_binding_id_fkey" FOREIGN KEY ("binding_id") REFERENCES "PlanBinding" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlanBindingDependency_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "PlanService" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_controller_id_key" ON "Plan"("controller_id");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_guard_id_key" ON "Plan"("guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_interceptor_id_key" ON "Plan"("interceptor_id");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_middleware_id_key" ON "Plan"("middleware_id");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_pipe_id_key" ON "Plan"("pipe_id");

-- CreateIndex
CREATE INDEX "PlanService_plan_id_idx" ON "PlanService"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "PlanServiceTag_service_id_position_key" ON "PlanServiceTag"("service_id", "position");

-- CreateIndex
CREATE INDEX "PlanBinding_plan_id_idx" ON "PlanBinding"("plan_id");

-- CreateIndex
CREATE INDEX "PlanServiceBinding_binding_id_idx" ON "PlanServiceBinding"("binding_id");

-- CreateIndex
CREATE INDEX "PlanBindingDependency_service_id_idx" ON "PlanBindingDependency"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "PlanBindingDependency_binding_id_kind_position_key" ON "PlanBindingDependency"("binding_id", "kind", "position");
