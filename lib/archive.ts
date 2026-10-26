import { createHash } from "crypto";
import { Readable } from "stream";
import { google } from "googleapis";
import { createServiceClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/csv";
import { todayIST } from "@/lib/content";
import { shiftDate } from "@/lib/utils";

const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");

export function archiveConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

async function ensureFolder(drive: any, name: string, parent: string): Promise<string> {
  const q = `name='${name}' and '${parent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const found = await drive.files.list({ q, fields: "files(id)", pageSize: 1, supportsAllDrives: true, includeItemsFromAllDrives: true });
  if (found.data.files?.length) return found.data.files[0].id as string;
  const made = await drive.files.create({
    requestBody: { name, parents: [parent], mimeType: "application/vnd.google-apps.folder" }, fields: "id", supportsAllDrives: true,
  });
  return made.data.id as string;
}

export type ArchiveResult = { ok: boolean; message: string; months: number };

/**
 * Safe archive: export -> upload -> download & verify (checksum + row count) -> log -> (optional) delete exactly the
 * archived row ids. If any step fails for a month, that month's rows are NOT deleted.
 */
export async function runArchive(triggeredBy: string): Promise<ArchiveResult> {
  const db = createServiceClient();
  const log = async (row: Record<string, unknown>) => { await db.from("archive_logs").insert({ triggered_by: triggeredBy, ...row }); };

  if (!archiveConfigured()) {
    const message = "Google Drive is not configured yet, so nothing was archived and nothing was deleted.";
    await log({ status: "skipped", message });
    return { ok: false, message, months: 0 };
  }

  const keepDays = Math.max(1, Number(process.env.ARCHIVE_KEEP_DAYS || 30));
  const cutoff = shiftDate(todayIST(), -keepDays);
  const deleteEnabled = process.env.ARCHIVE_DELETE_ENABLED === "true";

  const { data: rows, error } = await db.from("meal_donations")
    .select("*, ashrams(name)").lt("donation_date", cutoff).order("donation_date").limit(20000);
  if (error) { await log({ status: "failed", message: `Could not read records: ${error.message}` }); return { ok: false, message: "Could not read records.", months: 0 }; }
  if (!rows || rows.length === 0) {
    const message = `No records older than ${keepDays} days (before ${cutoff}). Nothing to archive.`;
    await log({ status: "skipped", message });
    return { ok: true, message, months: 0 };
  }

  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  const drive = google.drive({ version: "v3", auth });
  // With the narrow drive.file scope the app can only see folders it created itself, so by default it creates
  // (and reuses) a private root folder. GOOGLE_DRIVE_ROOT_FOLDER_ID may point to a folder the app can access.
  const root = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || (await ensureFolder(drive, "7 Star Foundation Archives", "root"));

  const byMonth = new Map<string, any[]>();
  for (const r of rows) { const k = String(r.donation_date).slice(0, 7); byMonth.set(k, [...(byMonth.get(k) ?? []), r]); }

  let done = 0;
  for (const [period, list] of Array.from(byMonth.entries())) {
    const [year, month] = period.split("-");
    try {
      const csv = toCsv(
        ["id", "date", "session", "ashram", "donor_name", "family_org", "occasion", "phone_private", "address_private", "notes_private", "public_display_consent", "status", "created_at"],
        list.map((r) => [r.id, r.donation_date, r.meal_session, r.ashrams?.name, r.donor_name, r.family_org, r.occasion, r.phone_private, r.address_private, r.notes_private, r.public_display_consent, r.status, r.created_at])
      );
      const checksum = sha(csv);
      const yearId = await ensureFolder(drive, year, root);
      const monthId = await ensureFolder(drive, month, yearId);
      const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13);
      const fileName = `meal-donations-${period}-${stamp}.csv`;

      const up = await drive.files.create({
        requestBody: { name: fileName, parents: [monthId], mimeType: "text/csv" },
        media: { mimeType: "text/csv", body: Readable.from([csv]) },
        fields: "id,name,size", supportsAllDrives: true,
      });
      const fileId = up.data.id as string;
      if (!fileId) throw new Error("Upload returned no file id.");

      // VERIFY: download the uploaded file and compare content.
      const dl = await drive.files.get({ fileId, alt: "media", supportsAllDrives: true }, { responseType: "text" });
      const back = typeof dl.data === "string" ? dl.data : String(dl.data);
      if (sha(back) !== checksum) throw new Error("Verification failed: uploaded file content does not match the export.");
      const backRows = back.split("\r\n").filter(Boolean).length - 1;
      // (a quoted newline inside a note could add lines; checksum equality above is the authoritative check)
      if (backRows < list.length) throw new Error("Verification failed: row count mismatch.");

      let deleted = 0;
      let note = `Verified (sha256 ${checksum.slice(0, 12)}…).`;
      if (deleteEnabled) {
        const ids = list.map((r) => r.id);
        for (let i = 0; i < ids.length; i += 200) {
          const { error: dErr, count } = await db.from("meal_donations").delete({ count: "exact" }).in("id", ids.slice(i, i + 200));
          if (dErr) { note += ` Delete stopped: ${dErr.message}`; break; }
          deleted += count ?? 0;
        }
      } else {
        note += " Automatic deletion is OFF, so records were kept in the database.";
      }
      await log({ period, status: "success", records_archived: list.length, records_deleted: deleted, drive_file_id: fileId, drive_file_name: fileName, checksum, message: note });
      done += 1;
    } catch (e: any) {
      await log({ period, status: "failed", records_archived: 0, records_deleted: 0, message: `${e?.message || "Unknown error"} No records were deleted for this month.` });
      return { ok: false, message: `Archive of ${period} failed: ${e?.message || "unknown error"}. Nothing was deleted.`, months: done };
    }
  }
  return { ok: true, message: `Archived ${done} month(s)${deleteEnabled ? "" : ". Records were kept because automatic deletion is off"}.`, months: done };
}
