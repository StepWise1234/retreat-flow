# Admin System Supabase Migration

## Status: Phase 1 Complete

The codebase is now ready for the Supabase migration. Here's what was done:

### What's Been Built

1. **Supabase Admin Hooks** (`src/hooks/useSupabaseAdmin.ts`)
   - `useTrainings()` - CRUD for trainings/retreats
   - `useParticipants()` - CRUD for participants
   - `useRegistrations()` - Pipeline management, stage moves, bulk operations
   - `useAppointments()` - Chemistry calls and interviews
   - `useAdminTasks()` - Task management
   - `useSupabaseAdminAvailable()` - Checks if migration is complete

2. **Hybrid AdminContext** (`src/contexts/AdminContext.tsx`)
   - Automatically uses Supabase when migration is complete
   - Falls back to AppContext (in-memory seed data) otherwise
   - All admin components can use `useAdmin()` instead of `useApp()`
   - Zero breaking changes to existing functionality

3. **Migration SQL** (`supabase/migrations/20260301010000_admin_schema.sql`)
   - Creates new tables: `participants`, `registrations`, `appointments`, `admin_tasks`
   - Enhances `trainings` table with admin fields
   - All RLS policies for security
   - Auto-capacity triggers

### How It Works

```
Portal (unchanged):
  ├── trainings table ✓
  ├── rooms table ✓
  ├── room_reservations table ✓
  ├── applications table ✓
  └── trainer_assignments table ✓

Admin Dashboard:
  ├── Before migration: Uses AppContext (seed data)
  └── After migration: Uses Supabase tables
      ├── trainings (enhanced)
      ├── participants (new)
      ├── registrations (new)
      ├── appointments (new)
      └── admin_tasks (new)
```

## Phase 2: Run the Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- See full SQL in: supabase/migrations/20260301010000_admin_schema.sql
```

Or copy from the migration file directly.

## Phase 3: Verify

After running the migration:

1. Refresh app.stepwise.education
2. The admin dashboard should now persist data to Supabase
3. Portal continues working exactly as before

## What's Preserved

All existing features work:
- ✅ Dashboard with retreat cards
- ✅ Kanban board view
- ✅ List view
- ✅ Calendar view
- ✅ Tasks view
- ✅ Participant cards and detail sheets
- ✅ Stage tracking and movement
- ✅ Bulk operations
- ✅ Quick add leads
- ✅ Accommodation selection
- ✅ Payment tracking
- ✅ Scheduling (chemistry calls, interviews)
- ✅ Risk & care flags
- ✅ Tasks
- ✅ Message templates
- ✅ Portal integration

## Files Changed

- `src/App.tsx` - Added AdminProvider wrapper
- `src/hooks/useSupabaseAdmin.ts` - NEW
- `src/contexts/AdminContext.tsx` - NEW
- `supabase/migrations/20260301010000_admin_schema.sql` - NEW
- `MIGRATION_CHECKLIST.md` - NEW
- `MIGRATION_README.md` - NEW (this file)

## Next Steps After Migration

1. Components can gradually switch from `useApp()` to `useAdmin()`
2. Eventually remove AppContext once fully migrated
3. Add trainer management UI in admin (can now query trainer_assignments)
