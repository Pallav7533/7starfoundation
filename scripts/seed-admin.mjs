// Creates (or updates) the single administrator account.
// Usage: put ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// in .env.local, run `npm run seed:admin`, then DELETE ADMIN_PASSWORD from .env.local.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !key || !email || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL or ADMIN_PASSWORD.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

let userId;
const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (created.error) {
  if (!/already|registered|exists/i.test(created.error.message)) {
    console.error("Could not create user:", created.error.message);
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) { console.error(error.message); process.exit(1); }
  const existing = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) { console.error("User exists but could not be found."); process.exit(1); }
  userId = existing.id;
  const upd = await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
  if (upd.error) { console.error("Password update failed:", upd.error.message); process.exit(1); }
  console.log("Existing user found; password updated.");
} else {
  userId = created.data.user.id;
  console.log("Admin user created.");
}

// Enforce "single administrator": remove any other admin rows, then register this one.
await supabase.from("admin_users").delete().neq("user_id", userId);
const { error } = await supabase.from("admin_users").upsert({ user_id: userId, email });
if (error) { console.error("admin_users insert failed (did you run schema.sql?):", error.message); process.exit(1); }

console.log(`Done. ${email} is now the only administrator. Remove ADMIN_PASSWORD from .env.local now.`);
