import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import * as schema from "./schema";

// Table types
export type Users = InferSelectModel<typeof schema.tbl_users>;
export type NewUsers = InferInsertModel<typeof schema.tbl_users>;

export type MedicalRecords = InferSelectModel<typeof schema.tbl_medical_records>;
export type NewMedicalRecords = InferInsertModel<typeof schema.tbl_medical_records>;

export type Diagnoses = InferSelectModel<typeof schema.tbl_diagnoses>;
export type NewDiagnoses = InferInsertModel<typeof schema.tbl_diagnoses>;

export type Prescriptions = InferSelectModel<typeof schema.tbl_prescriptions>;
export type NewPrescriptions = InferInsertModel<typeof schema.tbl_prescriptions>;

export type Appointments = InferSelectModel<typeof schema.tbl_appointments>;
export type NewAppointments = InferInsertModel<typeof schema.tbl_appointments>;

export type Insurances = InferSelectModel<typeof schema.tbl_insurance>;
export type NewInsurances = InferInsertModel<typeof schema.tbl_insurance>;

export type Chats = InferSelectModel<typeof schema.tbl_chats>;
export type NewChats = InferInsertModel<typeof schema.tbl_chats>;

export type RagQueries = InferSelectModel<typeof schema.tbl_rag_queries>;
export type NewRagQueries = InferInsertModel<typeof schema.tbl_rag_queries>;

export type AiResponses = InferSelectModel<typeof schema.tbl_ai_responses>;
export type NewAiResponses = InferInsertModel<typeof schema.tbl_ai_responses>;

export type AuditLogs = InferSelectModel<typeof schema.tbl_audit_logs>;
export type NewAuditLogs = InferInsertModel<typeof schema.tbl_audit_logs>;

export type Notifications = InferSelectModel<typeof schema.tbl_notifications>;
export type NewNotifications = InferInsertModel<typeof schema.tbl_notifications>;

export type TreatingPhysicianRelationships = InferSelectModel<typeof schema.tbl_treating_physician_relationships>;
export type NewTreatingPhysicianRelationships = InferInsertModel<typeof schema.tbl_treating_physician_relationships>;

export type Roles = InferSelectModel<typeof schema.tbl_roles>;
export type NewRoles = InferInsertModel<typeof schema.tbl_roles>;

export type Resources = InferSelectModel<typeof schema.tbl_resources>;
export type NewResources = InferInsertModel<typeof schema.tbl_resources>;

export type Actions = InferSelectModel<typeof schema.tbl_actions>;
export type NewActions = InferInsertModel<typeof schema.tbl_actions>;

export type Permissions = InferSelectModel<typeof schema.tbl_permissions>;
export type NewPermissions = InferInsertModel<typeof schema.tbl_permissions>;

export type UserRoles = InferSelectModel<typeof schema.tbl_user_roles>;
export type NewUserRoles = InferInsertModel<typeof schema.tbl_user_roles>;

// Zod schemas
export const UsersSchema = createSelectSchema(schema.tbl_users);
export const InsertUsersSchema = createInsertSchema(schema.tbl_users);

export const MedicalRecordsSchema = createSelectSchema(schema.tbl_medical_records);
export const InsertMedicalRecordsSchema = createInsertSchema(schema.tbl_medical_records);

export const DiagnosesSchema = createSelectSchema(schema.tbl_diagnoses);
export const InsertDiagnosesSchema = createInsertSchema(schema.tbl_diagnoses);

export const PrescriptionsSchema = createSelectSchema(schema.tbl_prescriptions);
export const InsertPrescriptionsSchema = createInsertSchema(schema.tbl_prescriptions);

export const AppointmentsSchema = createSelectSchema(schema.tbl_appointments);
export const InsertAppointmentsSchema = createInsertSchema(schema.tbl_appointments);

export const InsurancesSchema = createSelectSchema(schema.tbl_insurance);
export const InsertInsurancesSchema = createInsertSchema(schema.tbl_insurance);

export const ChatsSchema = createSelectSchema(schema.tbl_chats);
export const InsertChatsSchema = createInsertSchema(schema.tbl_chats);

export const RagQueriesSchema = createSelectSchema(schema.tbl_rag_queries);
export const InsertRagQueriesSchema = createInsertSchema(schema.tbl_rag_queries);

export const AiResponsesSchema = createSelectSchema(schema.tbl_ai_responses);
export const InsertAiResponsesSchema = createInsertSchema(schema.tbl_ai_responses);

export const AuditLogsSchema = createSelectSchema(schema.tbl_audit_logs);
export const InsertAuditLogsSchema = createInsertSchema(schema.tbl_audit_logs);

export const NotificationsSchema = createSelectSchema(schema.tbl_notifications);
export const InsertNotificationsSchema = createInsertSchema(schema.tbl_notifications);

export const TreatingPhysicianRelationshipsSchema = createSelectSchema(schema.tbl_treating_physician_relationships);
export const InsertTreatingPhysicianRelationshipsSchema = createInsertSchema(schema.tbl_treating_physician_relationships);

export const RolesSchema = createSelectSchema(schema.tbl_roles);
export const InsertRolesSchema = createInsertSchema(schema.tbl_roles);

export const ResourcesSchema = createSelectSchema(schema.tbl_resources);
export const InsertResourcesSchema = createInsertSchema(schema.tbl_resources);

export const ActionsSchema = createSelectSchema(schema.tbl_actions);
export const InsertActionsSchema = createInsertSchema(schema.tbl_actions);

export const PermissionsSchema = createSelectSchema(schema.tbl_permissions);
export const InsertPermissionsSchema = createInsertSchema(schema.tbl_permissions);

export const UserRolesSchema = createSelectSchema(schema.tbl_user_roles);
export const InsertUserRolesSchema = createInsertSchema(schema.tbl_user_roles);
