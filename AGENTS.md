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
- Team access uses shared codes stored in an encrypted session cookie; the owner is a Lovable Cloud account with the admin role in user_roles — this mirrors the original app's two access levels.
