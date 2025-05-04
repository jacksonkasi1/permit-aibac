// Import relations utility
import { relations } from "drizzle-orm";

// Import all tables
import {
  tbl_users,
  tbl_medical_records,
  tbl_diagnoses,
  tbl_prescriptions,
  tbl_appointments,
  tbl_insurance,
  tbl_chats,
  tbl_rag_queries,
  tbl_ai_responses,
  tbl_audit_logs,
  tbl_notifications,
  tbl_treating_physician_relationships,
  tbl_roles,
  tbl_resources,
  tbl_actions,
  tbl_permissions,
  tbl_user_roles,
} from "./index";

/**
 * Relations for users table
 */
export const tbl_users_relations = relations(tbl_users, ({ many }) => ({
  medical_records: many(tbl_medical_records, {
    relationName: "patient_medical_records",
  }),
  appointments_as_patient: many(tbl_appointments, {
    relationName: "patient_appointments",
  }),
  appointments_as_doctor: many(tbl_appointments, {
    relationName: "doctor_appointments",
  }),
  prescriptions_as_patient: many(tbl_prescriptions, {
    relationName: "patient_prescriptions",
  }),
  prescriptions_as_doctor: many(tbl_prescriptions, {
    relationName: "doctor_prescriptions",
  }),
  diagnoses: many(tbl_diagnoses, {
    relationName: "doctor_diagnoses",
  }),
  insurance: many(tbl_insurance, {
    relationName: "patient_insurance",
  }),
  chats: many(tbl_chats, {
    relationName: "user_chats",
  }),
  rag_queries: many(tbl_rag_queries, {
    relationName: "user_rag_queries",
  }),
  ai_responses: many(tbl_ai_responses, {
    relationName: "user_ai_responses",
  }),
  audit_logs: many(tbl_audit_logs, {
    relationName: "user_audit_logs",
  }),
  notifications: many(tbl_notifications, {
    relationName: "user_notifications",
  }),
  treating_patients: many(tbl_treating_physician_relationships, {
    relationName: "doctor_patients",
  }),
  treating_doctors: many(tbl_treating_physician_relationships, {
    relationName: "patient_doctors",
  }),
  user_roles: many(tbl_user_roles, {
    relationName: "user_role_assignments",
  }),
}));

/**
 * Relations for medical records table
 */
export const tbl_medical_records_relations = relations(tbl_medical_records, ({ one, many }) => ({
  patient: one(tbl_users, {
    fields: [tbl_medical_records.patient_id],
    references: [tbl_users.id],
    relationName: "patient_medical_records",
  }),
  diagnoses: many(tbl_diagnoses, {
    relationName: "medical_record_diagnoses",
  }),
  prescriptions: many(tbl_prescriptions, {
    relationName: "medical_record_prescriptions",
  }),
}));

/**
 * Relations for diagnoses table
 */
export const tbl_diagnoses_relations = relations(tbl_diagnoses, ({ one }) => ({
  medical_record: one(tbl_medical_records, {
    fields: [tbl_diagnoses.medical_record_id],
    references: [tbl_medical_records.id],
    relationName: "medical_record_diagnoses",
  }),
  doctor: one(tbl_users, {
    fields: [tbl_diagnoses.doctor_id],
    references: [tbl_users.id],
    relationName: "doctor_diagnoses",
  }),
}));

/**
 * Relations for prescriptions table
 */
export const tbl_prescriptions_relations = relations(tbl_prescriptions, ({ one }) => ({
  medical_record: one(tbl_medical_records, {
    fields: [tbl_prescriptions.medical_record_id],
    references: [tbl_medical_records.id],
    relationName: "medical_record_prescriptions",
  }),
  patient: one(tbl_users, {
    fields: [tbl_prescriptions.patient_id],
    references: [tbl_users.id],
    relationName: "patient_prescriptions",
  }),
  doctor: one(tbl_users, {
    fields: [tbl_prescriptions.doctor_id],
    references: [tbl_users.id],
    relationName: "doctor_prescriptions",
  }),
}));

/**
 * Relations for appointments table
 */
export const tbl_appointments_relations = relations(tbl_appointments, ({ one }) => ({
  patient: one(tbl_users, {
    fields: [tbl_appointments.patient_id],
    references: [tbl_users.id],
    relationName: "patient_appointments",
  }),
  doctor: one(tbl_users, {
    fields: [tbl_appointments.doctor_id],
    references: [tbl_users.id],
    relationName: "doctor_appointments",
  }),
}));

/**
 * Relations for insurance table
 */
export const tbl_insurance_relations = relations(tbl_insurance, ({ one }) => ({
  patient: one(tbl_users, {
    fields: [tbl_insurance.patient_id],
    references: [tbl_users.id],
    relationName: "patient_insurance",
  }),
}));

/**
 * Relations for chats table
 */
export const tbl_chats_relations = relations(tbl_chats, ({ one }) => ({
  user: one(tbl_users, {
    fields: [tbl_chats.user_id],
    references: [tbl_users.id],
    relationName: "user_chats",
  }),
}));

/**
 * Relations for RAG queries table
 */
export const tbl_rag_queries_relations = relations(tbl_rag_queries, ({ one, many }) => ({
  user: one(tbl_users, {
    fields: [tbl_rag_queries.user_id],
    references: [tbl_users.id],
    relationName: "user_rag_queries",
  }),
  ai_responses: many(tbl_ai_responses, {
    relationName: "query_responses",
  }),
}));

/**
 * Relations for AI responses table
 */
export const tbl_ai_responses_relations = relations(tbl_ai_responses, ({ one }) => ({
  query: one(tbl_rag_queries, {
    fields: [tbl_ai_responses.query_id],
    references: [tbl_rag_queries.id],
    relationName: "query_responses",
  }),
  user: one(tbl_users, {
    fields: [tbl_ai_responses.user_id],
    references: [tbl_users.id],
    relationName: "user_ai_responses",
  }),
}));

/**
 * Relations for audit logs table
 */
export const tbl_audit_logs_relations = relations(tbl_audit_logs, ({ one }) => ({
  user: one(tbl_users, {
    fields: [tbl_audit_logs.user_id],
    references: [tbl_users.id],
    relationName: "user_audit_logs",
  }),
}));

/**
 * Relations for notifications table
 */
export const tbl_notifications_relations = relations(tbl_notifications, ({ one }) => ({
  user: one(tbl_users, {
    fields: [tbl_notifications.user_id],
    references: [tbl_users.id],
    relationName: "user_notifications",
  }),
}));

/**
 * Relations for treating physician relationships table
 */
export const tbl_treating_physician_relationships_relations = relations(tbl_treating_physician_relationships, ({ one }) => ({
  doctor: one(tbl_users, {
    fields: [tbl_treating_physician_relationships.doctor_id],
    references: [tbl_users.id],
    relationName: "doctor_patients",
  }),
  patient: one(tbl_users, {
    fields: [tbl_treating_physician_relationships.patient_id],
    references: [tbl_users.id],
    relationName: "patient_doctors",
  }),
}));

/**
 * Relations for roles table
 */
export const tbl_roles_relations = relations(tbl_roles, ({ many }) => ({
  permissions: many(tbl_permissions, {
    relationName: "role_permissions",
  }),
  user_roles: many(tbl_user_roles, {
    relationName: "role_users",
  }),
}));

/**
 * Relations for resources table
 */
export const tbl_resources_relations = relations(tbl_resources, ({ many }) => ({
  actions: many(tbl_actions, {
    relationName: "resource_actions",
  }),
  user_roles: many(tbl_user_roles, {
    relationName: "resource_users",
  }),
}));

/**
 * Relations for actions table
 */
export const tbl_actions_relations = relations(tbl_actions, ({ one, many }) => ({
  resource: one(tbl_resources, {
    fields: [tbl_actions.resource_id],
    references: [tbl_resources.id],
    relationName: "resource_actions",
  }),
  permissions: many(tbl_permissions, {
    relationName: "action_roles",
  }),
}));

/**
 * Relations for permissions table
 */
export const tbl_permissions_relations = relations(tbl_permissions, ({ one }) => ({
  role: one(tbl_roles, {
    fields: [tbl_permissions.role_id],
    references: [tbl_roles.id],
    relationName: "role_permissions",
  }),
  action: one(tbl_actions, {
    fields: [tbl_permissions.action_id],
    references: [tbl_actions.id],
    relationName: "action_roles",
  }),
}));

/**
 * Relations for user roles table
 */
export const tbl_user_roles_relations = relations(tbl_user_roles, ({ one }) => ({
  user: one(tbl_users, {
    fields: [tbl_user_roles.user_id],
    references: [tbl_users.id],
    relationName: "user_role_assignments",
  }),
  role: one(tbl_roles, {
    fields: [tbl_user_roles.role_id],
    references: [tbl_roles.id],
    relationName: "role_users",
  }),
  resource: one(tbl_resources, {
    fields: [tbl_user_roles.resource_id],
    references: [tbl_resources.id],
    relationName: "resource_users",
  }),
})); 