## Findings (real bugs, not just polish)

### Groups section
1. **Dead "Create Group" button** inside `GroupManagement` card header (line ~120) — no `onClick`. The working button lives in `AdminDashboard` header. Either wire it or remove it.
2. **Completed groups never appear** — `GroupManagement` fetches only `active` + `upcoming`. Admin can't review or open a completed group from here at all.
3. **`GroupDetailsView` modal is broken** — calls two endpoints that do not exist:
   - `GET /month/group/:groupId` (only `/month/group/:groupId/:monthName` exists)
   - `GET /payment/month/:monthId` (not defined)
   The "View" button on every row opens an empty modal. Rewire to the existing `POST /month/group/batch/:groupId` that `GroupMonthManagement` already uses, and derive per-month member payment status from that response — no new backend routes.
4. **Banner toggle** uses raw `fetch` instead of `apiFetch`, and silently succeeds on failure (no `res.ok` check). Standardize on `apiFetch` for consistent auth/error handling.
5. **Progress % on completed groups** can exceed 100 visually because `calculateCurrentMonth` isn't clamped to tenure before dividing (currently clamps only the % via `Math.min`). Also show `tenure/tenure` on completed rows, and hide the "Banner" action on non-upcoming rows (already correct — verify).

### Members section
1. **Dead admin actions** — `handleMemberAction` and `updateShareAmount` in `MemberManagement` call `/group/member-action` and `/group/update-share`, neither of which exist on the backend. No UI currently calls them, so this is dead code. Remove.
2. **Ghost fields** — both `MemberManagement` and `UserGroupsView` read `member.joinDate` and `member.role`, which are not on the `Group.members` schema. Result: "Joined …" line and "Role" column always render fallbacks. Replace with data that does exist:
   - Use `group.createdAt` or `group.startMonth` as the join reference.
   - Drop the "Role" column (the schema has no role — the concept doesn't apply here). Keep the special "Foreman" surfacing only if we later add a field for it.
3. **`UserGroupsView` uses raw `fetch`** instead of `apiFetch`, and doesn't handle non-2xx (e.g. 401 shows "User not found"). Switch to `apiFetch`.
4. **"Completed only" filter** in `MemberManagement` excludes users who have both completed and active groups — the label is misleading. Change to "Has completed groups" (any user with `completedGroups > 0`).
5. **CSV export** doesn't quote fields — names/emails with commas break the file. Wrap each cell in quotes and escape existing quotes.
6. **`filteredUsers.length` in the header** is used correctly, but the empty state text says "No users found matching your criteria" even when there are simply no users at all. Split the two empty states.

### Backend correctness (touched only where a frontend fix depends on it)
- `groupRoute.patch('/leave/:groupid')` uses `group.members.some(memberId => memberId.equals(userId))` — but `members` is an array of subdocuments with a `.userId` field. This route is broken. Fix comparison to `m.userId.equals(userId)` and filter accordingly. (Users cannot actually leave today.)

### UI polish (scoped, no redesign)
- Add a small status filter (All / Active / Upcoming / Completed) at the top of `GroupManagement` so completed groups are reachable.
- Consistent empty states and a subtle skeleton on `MemberManagement` and `GroupManagement` (already have loaders — just align copy).
- `UserGroupsView`: remove the hard-coded "MS" avatar tile in the header (it's a stray artifact from a template) and use the app's actual header via `AppLayout`, matching the rest of the admin pages.
- `GroupDetailsView`: since it's a modal with real data now, add a compact "Paid / Total" chip per month tile so admin sees status at a glance.

## Files to change

Frontend
- `frontend/src/components/GroupManagement.jsx` — remove dead button; add status filter; include completed; switch banner save to `apiFetch`; clamp progress display.
- `frontend/src/components/GroupDetailsView.jsx` — rewrite data fetching to use the existing `/month/group/batch/:groupId` route; render real per-member payment status; add paid/total chip per month.
- `frontend/src/components/MemberManagement.jsx` — drop dead handlers; fix "Completed only" label + logic; quote CSV cells; split empty states; drop `joinDate`/`role` refs.
- `frontend/src/components/UserGroupsView.jsx` — use `apiFetch`; drop `member.joinDate`/`member.role` usage; wrap in `AppLayout`; remove stray "MS" tile.

Backend
- `Backend/Routes/group.js` — fix `PATCH /leave/:groupid` to compare `m.userId` correctly.

## Out of scope (call out, don't do)
- No schema changes.
- No new endpoints.
- No changes to `GroupMonthManagement` beyond what's needed for shared UI helpers (its data path already works).
- No auth/session changes.

## Verification
After edits: `bun run build` for typecheck/build; then Playwright smoke pass on `/` → login → admin dashboard → Groups tab (filter Completed, open "View" modal, open "Manage") → Members tab (search, edit alias, "Groups" navigation to `UserGroupsView`) → back. Screenshot each step and confirm no console errors.

Confirm to proceed and I'll implement in one pass.