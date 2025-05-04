CREATE TABLE "tbl_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"department" text,
	"clearance" integer,
	"specialization" text,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"tenant_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tbl_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tbl_roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_role_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tbl_resources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_resource_key" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tbl_actions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"resource_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_resource_action" UNIQUE("resource_id","key")
);
--> statement-breakpoint
CREATE TABLE "tbl_permissions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role_id" uuid NOT NULL,
	"action_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_role_action" UNIQUE("role_id","action_id")
);
--> statement-breakpoint
CREATE TABLE "tbl_user_roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"resource_id" uuid,
	"resource_instance_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_role_resource" UNIQUE("user_id","role_id","resource_id","resource_instance_id")
);
--> statement-breakpoint
CREATE TABLE "tbl_medical_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"sensitivity" text NOT NULL,
	"department" text,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_diagnoses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"medical_record_id" uuid NOT NULL,
	"condition" text NOT NULL,
	"details" text,
	"date" date NOT NULL,
	"doctor_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_prescriptions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"medical_record_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"medication" text NOT NULL,
	"dosage" text NOT NULL,
	"instructions" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_appointments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"date_time" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'Scheduled' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_insurance" (
	"id" uuid PRIMARY KEY NOT NULL,
	"patient_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"policy_number" text NOT NULL,
	"coverage" jsonb,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patient_id_unique" UNIQUE("patient_id")
);
--> statement-breakpoint
CREATE TABLE "tbl_chats" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_rag_queries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"query" text NOT NULL,
	"resource_type" text,
	"results" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_ai_responses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"query_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"source_references" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_audit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_role" text NOT NULL,
	"action" text NOT NULL,
	"resource" text NOT NULL,
	"allowed" boolean NOT NULL,
	"context" jsonb NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "tbl_notifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"type" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tbl_treating_physician_relationships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"doctor_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_doctor_patient" UNIQUE("doctor_id","patient_id")
);
--> statement-breakpoint
ALTER TABLE "tbl_actions" ADD CONSTRAINT "tbl_actions_resource_id_tbl_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."tbl_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_permissions" ADD CONSTRAINT "tbl_permissions_role_id_tbl_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."tbl_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_permissions" ADD CONSTRAINT "tbl_permissions_action_id_tbl_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."tbl_actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_user_roles" ADD CONSTRAINT "tbl_user_roles_user_id_tbl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tbl_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_user_roles" ADD CONSTRAINT "tbl_user_roles_role_id_tbl_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."tbl_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_user_roles" ADD CONSTRAINT "tbl_user_roles_resource_id_tbl_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."tbl_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_medical_records" ADD CONSTRAINT "tbl_medical_records_patient_id_tbl_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_diagnoses" ADD CONSTRAINT "tbl_diagnoses_medical_record_id_tbl_medical_records_id_fk" FOREIGN KEY ("medical_record_id") REFERENCES "public"."tbl_medical_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_diagnoses" ADD CONSTRAINT "tbl_diagnoses_doctor_id_tbl_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_prescriptions" ADD CONSTRAINT "tbl_prescriptions_medical_record_id_tbl_medical_records_id_fk" FOREIGN KEY ("medical_record_id") REFERENCES "public"."tbl_medical_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_prescriptions" ADD CONSTRAINT "tbl_prescriptions_patient_id_tbl_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_prescriptions" ADD CONSTRAINT "tbl_prescriptions_doctor_id_tbl_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_appointments" ADD CONSTRAINT "tbl_appointments_patient_id_tbl_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_appointments" ADD CONSTRAINT "tbl_appointments_doctor_id_tbl_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_insurance" ADD CONSTRAINT "tbl_insurance_patient_id_tbl_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_chats" ADD CONSTRAINT "tbl_chats_user_id_tbl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_rag_queries" ADD CONSTRAINT "tbl_rag_queries_user_id_tbl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_ai_responses" ADD CONSTRAINT "tbl_ai_responses_query_id_tbl_rag_queries_id_fk" FOREIGN KEY ("query_id") REFERENCES "public"."tbl_rag_queries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_ai_responses" ADD CONSTRAINT "tbl_ai_responses_user_id_tbl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_audit_logs" ADD CONSTRAINT "tbl_audit_logs_user_id_tbl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_notifications" ADD CONSTRAINT "tbl_notifications_user_id_tbl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_treating_physician_relationships" ADD CONSTRAINT "tbl_treating_physician_relationships_doctor_id_tbl_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tbl_treating_physician_relationships" ADD CONSTRAINT "tbl_treating_physician_relationships_patient_id_tbl_users_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."tbl_users"("id") ON DELETE no action ON UPDATE no action;