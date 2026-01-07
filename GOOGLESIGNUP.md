

# Google Signup / Login – Implementation Guide

This document explains **how Google Signup/Login should work** in our system and **what needs to be implemented**.

---

## 🔑 Core Rule (Very Important)

**Email is the unique identity of a user**

* One email = one user record
* Google login must **reuse the same account** if the email already exists
* No duplicate users for the same email

---

## 🧠 High-Level Idea

Google Login is **not a separate account system**.
It is only a **verified way to authenticate an email**.

If a user:

* already signed up
* already made a payment
* already exists in DB

👉 Google login with the same email must log them into **that same account**.

---

## 🔄 Overall Flow

### 1. Frontend (Angular)

* Show **“Continue with Google”** button
* On success, Google returns an **ID Token**
* Send token to backend:

```http
POST /auth/google
```

---

### 2. Backend – Verify Google Token

* Verify ID token using Google SDK
* Extract:

  * `email`
  * `googleId (sub)`
  * `email_verified`

❌ Reject login if `email_verified === false`

---

### 3. Find User by Email (Key Step)

```sql
SELECT * FROM users WHERE email = ?
```

---

## ✅ Backend Decision Logic

### Case 1: User exists with same email

* If `googleId` is **NULL**

  * Link Google account → save `googleId`
* If `googleId` **matches**

  * Login user
* If `googleId` is **different**

  * ❌ Block login (security issue)

➡️ User logs into the **same existing account**

---

### Case 2: User does NOT exist

* Create new user:

  * `email`
  * `googleId`
  * `passwordHash = NULL`
  * `is_email_verified = 1`
* Login user

---

### Case 3: Email exists but linked to another Google account

* ❌ Reject login
* Show error:

```
This email is already linked to another Google account
```

---

## 🔐 JWT / Session Handling

* After successful login:

  * Generate JWT (access / refresh as per system)
  * Return tokens to frontend
* Frontend stores token and logs user in

---

## 🔑 Email/Password vs Google Rules

* Email + Password user → Google login allowed (link account)
* Google-only user → Password login blocked
* Optional feature: **“Set Password”** later

---

## 💳 Payment Integration Rule (Important)

During payment:

* Always identify user by **email**
* If email exists → attach payment to that user
* If email does not exist → create a user with:

  * `email`
  * `passwordHash = NULL`
  * `googleId = NULL`

Later:

* Google login with same email → logs into **same paid account**

---

## 🧾 Database Notes

* `users.email` → **UNIQUE**
* `users.googleId` → should be UNIQUE
* `passwordHash` can be `NULL` for Google-only users

---

## 🧠 One-Line Summary

> Google login only verifies email and links to an existing user.
> It must NEVER create duplicate users for the same email.

---

