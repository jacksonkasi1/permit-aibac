# Data Entities for Secure AI Medical System

## Core Data Entities

1. **User**
   - Primary entity representing system users with different roles

2. **MedicalRecord**
   - Patient medical histories, diagnoses, and treatments

3. **Prescription**
   - Medication prescriptions and history

4. **Appointment**
   - Doctor-patient appointment information

5. **Diagnosis**
   - Medical diagnoses with detailed information

6. **Insurance**
   - Patient insurance details

7. **Chat**
   - AI conversation sessions and history

8. **RAGQuery**
   - Vector search queries for retrieving medical information

9. **AIResponse**
   - Generated responses from the AI system

10. **AuditLog**
    - Records of all system interactions for compliance

11. **Notification**
    - System notifications and alerts

## Entity Attributes

### User
- id (string)
- email (string) - *implied*
- name (string) - *implied*
- role (string) - e.g., "Admin", "Doctor", "Patient", "Researcher"
- department (string) - e.g., "Cardiology", "Pediatrics"
- clearance (number) - Access level (1-5)
- specialization (string) - Medical specialization
- isBlocked (boolean) - User access restriction flag
- tenantId (string) - *implied for multi-tenant system*
- createdAt (date) - *implied*
- updatedAt (date) - *implied*

### MedicalRecord
- id (string) - *implied*
- patientId (string) - Owner ID
- sensitivity (string) - "Normal", "Sensitive", or "Restricted"
- department (string) - Associated medical department
- content (string/object) - *implied*
- createdAt (date) - *implied*
- updatedAt (date) - *implied*

### Prescription
- id (string) - *implied*
- medicalRecordId (string) - *implied parent relationship*
- patientId (string) - *implied*
- doctorId (string) - *implied*
- medication (string) - *implied*
- dosage (string) - *implied*
- instructions (string) - *implied*
- startDate (date) - *implied*
- endDate (date) - *implied*
- createdAt (date) - *implied*
- updatedAt (date) - *implied*

### Appointment
- id (string) - *implied*
- patientId (string) - *implied*
- doctorId (string) - *implied*
- dateTime (date) - *implied*
- status (string) - "Scheduled", "Cancelled", "Completed"
- notes (string) - *implied*
- createdAt (date) - *implied*
- updatedAt (date) - *implied*

### Diagnosis
- id (string) - *implied*
- medicalRecordId (string) - *implied as parent relationship*
- condition (string) - Diagnosis category (e.g., diabetes, cancer)
- details (string) - *implied*
- date (date) - *implied*
- doctorId (string) - *implied*
- createdAt (date) - *implied*
- updatedAt (date) - *implied*

### Insurance
- id (string) - *implied*
- patientId (string) - *implied*
- provider (string) - *implied*
- policyNumber (string) - *implied*
- coverage (string/object) - *implied*
- startDate (date) - *implied*
- endDate (date) - *implied*
- createdAt (date) - *implied*
- updatedAt (date) - *implied*

### Chat
- id (string) - *implied*
- userId (string) - *implied*
- messages (array) - *implied*
- startedAt (date) - *implied*
- updatedAt (date) - *implied*

### RAGQuery
- id (string) - *implied*
- userId (string) - *implied*
- query (string) - *implied*
- timestamp (date) - *implied*
- resourceType (string) - *implied*
- results (array) - *implied*

### AIResponse
- id (string) - *implied*
- queryId (string) - *implied*
- userId (string) - *implied*
- content (string) - *implied*
- timestamp (date) - *implied*
- sourceReferences (array) - *implied*

### AuditLog
- id (string) - *implied*
- timestamp (date)
- userId (string)
- userRole (string)
- action (string)
- resource (string)
- allowed (boolean)
- context (object) - Contains IP, userAgent, etc.

### Notification
- id (string) - *implied*
- userId (string) - *implied*
- content (string) - *implied*
- type (string) - *implied*
- read (boolean) - *implied*
- timestamp (date) - *implied*

## User Actions (CRUD)

### MedicalRecord
- Create MedicalRecord
- View MedicalRecord
- Update MedicalRecord
- Delete MedicalRecord
- Share MedicalRecord

### Prescription
- Create Prescription
- View Prescription
- Update Prescription

### Appointment
- Create Appointment
- View Appointment
- Update Appointment

### Diagnosis
- Create Diagnosis
- View Diagnosis
- Update Diagnosis

### Insurance
- View Insurance
- Update Insurance

### Chat
- Create Chat
- View Chat

### RAGQuery
- Search (execute query)

### AIResponse
- View AIResponse
- Mask AIResponse (filter sensitive information)

### AuditLog
- View AuditLog

### Notification
- View Notification

## Entity Relationships

1. **Patient → MedicalRecord**
   - Patient owns MedicalRecord (owner relationship)

2. **Doctor → Patient**
   - Doctor treats Patient (treating physician relationship)

3. **MedicalRecord → Diagnosis**
   - MedicalRecord contains Diagnosis (parent relationship)

4. **MedicalRecord → Prescription**
   - MedicalRecord contains Prescription (parent relationship)

5. **Patient → Appointment**
   - Patient schedules Appointment

6. **Doctor → Appointment**
   - Doctor participates in Appointment

7. **Patient → Insurance**
   - Patient has Insurance information

8. **User → Chat**
   - User participates in Chat sessions

9. **User → RAGQuery**
   - User executes RAGQuery for information retrieval

10. **RAGQuery → AIResponse**
    - RAGQuery generates AIResponse

11. **User → AuditLog**
    - User actions are recorded in AuditLog

12. **User → Notification**
    - User receives Notifications

13. **Role → Resource**
    - Roles control access to Resources (authorization relationship)
    
14. **MedicalRecord#Owner → Diagnosis#Viewer**
    - Patient can view their diagnoses (role derivation)

15. **MedicalRecord#Editor → Diagnosis#Editor**
    - Doctor can edit diagnoses for assigned patients (role derivation)

16. **Patient treating_physician Doctor → MedicalRecord#Editor**
    - Doctor can edit records of patients they treat (role derivation)
