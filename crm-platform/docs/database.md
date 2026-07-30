# Database Design

## Overview

CRM Platform побудована за принципом Multi-Tenant.

Кожна компанія має власний Workspace.

Усі дані ізольовані всередині Workspace.

---

# Domain

Identity

↓

Workspace

↓

Metadata

↓

Records

↓

Automation

↓

Notifications

↓

Files

↓

Audit

---

# Identity

Відповідає за користувачів системи.

## User

Описує користувача.

Fields

- id
- email
- password
- firstName
- lastName
- avatar
- isActive
- createdAt
- updatedAt

---

# Workspace

Workspace — окрема компанія.

Наприклад

Dental Clinic

Auto Service

Restaurant

Beauty Salon

Fields

- id
- name
- slug
- logo
- ownerId
- createdAt
- updatedAt

---

## Workspace Member

Зв'язок між User та Workspace.

Один User може бути учасником багатьох Workspace.

Fields

- id
- workspaceId
- userId
- roleId
- joinedAt

---

# Roles

Ролі всередині Workspace.

Fields

- id
- workspaceId
- name
- description

Приклади

Owner

Admin

Manager

Employee

---

# Permissions

Описує дозволи ролі.

Fields

- id
- roleId
- resource
- action

Наприклад

records.read

records.create

records.update

records.delete

---

# Metadata

Metadata описує структуру CRM.

---

## Module

Модуль.

Приклади

Customers

Orders

Invoices

Cars

Employees

Fields

- id
- workspaceId
- name
- icon
- color
- description
- createdAt

---

## Field

Поле модуля.

Fields

- id
- moduleId
- name
- type
- required
- unique
- order

---

Типи полів

Text

Textarea

Number

Boolean

Date

Time

Email

Phone

URL

Select

MultiSelect

Currency

File

Image

Relation

Formula

---

## View

Збережене представлення.

Fields

- id
- moduleId
- name
- filters
- sorting
- columns

---

# Records

---

## Record

Запис.

Fields

- id
- moduleId
- createdBy
- createdAt
- updatedAt

---

## Record Value

Значення поля.

Fields

- id
- recordId
- fieldId
- value

---

## Record Relation

Зв'язок між записами.

Наприклад

Order

↓

Customer

Fields

- id
- fromRecordId
- toRecordId

---

# Files

Файли.

Fields

- id
- workspaceId
- name
- path
- mimeType
- size
- uploadedBy
- createdAt

---

# Notifications

Повідомлення.

Fields

- id
- workspaceId
- type
- title
- message
- read
- createdAt

---

# Workflow

Автоматизація.

Fields

- id
- workspaceId
- name
- trigger
- enabled

---

# Audit Log

Журнал подій.

Fields

- id
- workspaceId
- userId
- action
- entity
- entityId
- createdAt