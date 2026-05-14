# Inventory Evaluation System — Setup Guide

## 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **SQL Editor**, paste and run the entire contents of `supabase/schema.sql`.
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon / public` key

## 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL and anon key.

## 3. Create User Accounts

In Supabase → **Authentication → Users**, create accounts manually:

### Supervisor (you)
- Email: your email
- Password: strong password
- After creating, run this SQL to set the role:
```sql
UPDATE profiles SET role = 'supervisor', full_name = 'Your Name' WHERE email = 'your@email.com';
```

### Conductors (one per evaluator)
- Create each in Authentication → Users
- Assign a branch by running:
```sql
UPDATE profiles
SET full_name = 'Conductor Name', branch_id = (SELECT id FROM branches WHERE name = 'فرعی سەنتەر')
WHERE email = 'conductor@email.com';
```

## 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Routes

| URL | Who sees it |
|-----|-------------|
| `/login` | Everyone (unauthenticated) |
| `/conductor` | Conductors only |
| `/supervisor` | Supervisor only |

## 6. Add More Branches

```sql
INSERT INTO branches (name) VALUES ('New Branch Name');
```
