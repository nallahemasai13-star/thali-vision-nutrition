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

- Photo recognition lives in PhotoAnalyzer and uses the authenticated analyzeFood RPC; catalog IDs drive meal selection while predicted slugs and original confidence remain attached to saved corrections.
- Load catalog and personal history through route query loaders; render persisted nutrition snapshots in history rather than recalculating historical meals from current catalog values.
