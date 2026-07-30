# Architecture

## Overview

CRM Platform — це SaaS-платформа, побудована за принципом **Modular Monolith**.

Кожна частина системи ізольована в окремому модулі та відповідає лише за свою область.

---

# Principles

## Single Responsibility

Кожен модуль виконує лише одну задачу.

Наприклад:

- Auth відповідає лише за авторизацію.
- Users відповідає лише за користувачів.
- Records відповідає лише за записи.

---

## Low Coupling

Модулі не повинні знати внутрішню реалізацію один одного.

Правильно:

Records → Users (через Repository або Service)

Неправильно:

Records → Prisma → Users Table

---

## High Cohesion

Усе, що стосується одного модуля, знаходиться в одному місці.

Наприклад:

modules/users

controllers

services

repositories

dto

entities

users.module.ts

---

## Dependency Direction

Controller

↓

Service

↓

Repository

↓

Database

Зворотних залежностей бути не повинно.

---

# Backend Structure

src

core

common

config

modules

main.ts

app.module.ts

---

# Core

Core містить інфраструктуру, яка не залежить від CRM.

core

auth

cache

logger

prisma

storage

mail

events

---

## Prisma

Відповідає лише за підключення до бази даних.

Не містить бізнес логіки.

---

## Logger

Єдина система логування.

---

## Storage

Працює з файлами.

Наприклад:

AWS S3

MinIO

Local Storage

---

## Mail

Відправка email.

---

## Events

Події всередині системи.

---

# Common

Спільний код.

common

decorators

guards

filters

interceptors

pipes

exceptions

utils

constants

---

# Modules

Кожен модуль ізольований.

modules

auth

users

workspaces

metadata

records

files

notifications

audit

workflows

---

# Module Structure

Кожен модуль має однакову структуру.

module

controllers

services

repositories

dto

entities

module.ts

---

## Controllers

Працюють лише з HTTP.

Не містять бізнес логіки.

Приклад:

POST /users

GET /users

---

## Services

Вся бізнес логіка.

Приклад:

Create User

Update User

Invite User

Delete User

---

## Repositories

Працюють лише з базою даних.

Вони нічого не знають про HTTP.

---

## DTO

Описують вхідні дані.

---

## Entities

Описують модель даних.

---

# Main Modules

## Auth

Відповідає за:

- Login
- Register
- JWT
- Refresh Token
- Password Hashing

---

## Users

Відповідає за:

- Users
- Profile
- Avatar

---

## Workspaces

Відповідає за:

- Companies
- Members
- Roles
- Permissions

---

## Metadata

Описує структуру CRM.

Містить:

- Modules
- Fields
- Views

Саме Metadata дозволяє створювати CRM без написання коду.

---

## Records

Містить усі записи користувачів.

Наприклад:

Customers

Orders

Cars

Employees

---

## Files

Відповідає за:

- Upload
- Download
- Delete

---

## Notifications

Відповідає за:

- Email
- Push
- Telegram

---

## Workflow

Автоматизація.

Наприклад:

IF

Status == Done

↓

Send Email

↓

Create Invoice

---

## Audit

Журнал усіх дій користувачів.

---

# Request Flow

Client

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

---

# Error Handling

Помилки обробляються через Global Exception Filter.

---

# Validation

Валідація виконується через DTO.

---

# Authentication

JWT Access Token

↓

JWT Refresh Token

↓

Guards

↓

Current User

---

# Authorization

RBAC (Role Based Access Control)

User

↓

Role

↓

Permissions

---

# Logging

Усі помилки логуються.

Усі критичні дії записуються в Audit Log.

---

# Future Improvements

- Event Bus
- Queue
- WebSockets
- Caching
- AI Services
- Billing