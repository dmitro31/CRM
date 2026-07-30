# Data Model

## Identity

### User

Відповідає за користувача системи.

Relationship

User

↓

WorkspaceMember

Один користувач може бути учасником багатьох Workspace.

---

## Workspace

Workspace — окрема компанія.

Приклади

Restaurant

Dental Clinic

Auto Service

Beauty Salon

Relationship

Workspace

↓

Modules

↓

Records

↓

Files

↓

Workflow

↓

Audit

---

## Metadata

Metadata відповідає за структуру CRM.

### Module

Наприклад

Customers

Orders

Invoices

Cars

Employees

Module містить багато Field.

Module містить багато Record.

Module містить багато View.

---

### Field

Поле описує один атрибут.

Наприклад

First Name

Phone

Email

Price

Status

Created At

---

### View

View — збережене представлення.

Наприклад

Усі клієнти

VIP

Нові

Архів

---

## Records

### Record

Record — один запис.

Наприклад

Клієнт

Автомобіль

Замовлення

Працівник

---

### RecordValue

Значення конкретного поля.

Наприклад

Ім'я

↓

Дмитро

Телефон

↓

099...

Email

↓

example@gmail.com

---

### RecordRelation

Зв'язок між записами.

Наприклад

Замовлення

↓

Клієнт

або

Автомобіль

↓

Власник

---

## Workflow

Автоматизація.

Trigger

↓

Condition

↓

Actions

---

## Notifications

Email

Telegram

Push

---

## Files

Будь-які вкладення.

Фото

PDF

Документи

---

## Audit

Журнал дій.

Створив запис.

Оновив запис.

Видалив запис.

Увійшов у систему.