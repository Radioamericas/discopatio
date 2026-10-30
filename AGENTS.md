<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All app tables are reachable only from server functions in src/lib/radio.functions.ts (RLS on, no policies) — the public site has no user accounts, so access is enforced in server code.
- Team access accepts existing encrypted code sessions or owner-provisioned Cloud accounts with a profile and user role; owner privileges require the separate admin role, so creating a team account never grants owner access.
- Account management lives in src/lib/team-accounts.functions.ts with authenticated role checks before privileged operations; a signup trigger accepts only trusted app_metadata set by owner provisioning and automatic first-owner assignment is disabled, preventing public registration escalation.
- Team credential helpers normalize usernames into reserved synthetic emails; owner provisioning confirms these undeliverable addresses individually, without changing global email confirmation settings.
- The public site's frozen/coming-soon state is driven only by SITE_LOCKED in src/lib/site-lock.ts, so reopening the site is a one-flag change and /admin is never locked out.
