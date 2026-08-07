# Sheet API (Apps Script)

A token-protected JSON API over one Google Sheet, so Claude can read your task
list and write back to it.

## Deploy (about 3 minutes)

1. Open your sheet → **Extensions → Apps Script**.
2. Delete the stub `myFunction`, paste in everything from `Code.gs`, save.
3. In the left sidebar hit the gear (**Project Settings**) and tick
   _"Show appsscript.json manifest file in editor"_. Go back to the editor,
   open `appsscript.json`, and paste in the one from this folder.
4. In the function dropdown pick **`setupToken`** and click **Run**. Approve the
   permission prompt. It will warn that the app isn't verified — that's expected
   for your own script; click _Advanced → Go to (project name)_.
5. Copy the token out of the execution log (`API_TOKEN = ...`).
6. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, then copy the `/exec` URL.
7. Give me the URL and the token.

## Why "Anyone" is safe here

Claude has no Google account to authenticate as, so the endpoint has to accept
anonymous requests. The token is what protects it. That means:

- **The URL + token together are a password to this sheet.** Anyone holding both
  can read and edit it. Don't paste them into a public repo or an issue tracker.
- Keep the sheet scoped to things you don't mind living behind that one secret.
- To revoke: run `setupToken` again (new token, old one dies instantly), or
  **Deploy → Manage deployments → Archive**.

## API

All actions work over `GET` with query params, and over `POST` with a JSON body.
Every request needs `token`. `sheet` defaults to `Sheet1`. Row 1 is the header.

| Action   | Params                         | Does                                                                    |
| -------- | ------------------------------ | ----------------------------------------------------------------------- |
| `sheets` | —                              | Lists tabs with their sizes                                             |
| `read`   | `sheet`                        | Returns headers + every non-empty row, each tagged with its real `_row` |
| `update` | `sheet`, `row`, `col`, `value` | Sets one cell                                                           |
| `append` | `sheet`, `values`              | Adds a row                                                              |
| `delete` | `sheet`, `row`                 | Removes a row                                                           |

`col` takes a header name (`Status`), a column letter (`C`), or a 1-based index.
`row` is the sheet's own row number — the same `_row` that `read` hands back, so
you can round-trip a row without counting.

`values` for `append` is a JSON object keyed by header name (unlisted columns go
blank), or a plain array of cells in column order.

Examples:

```
.../exec?token=TOKEN&action=read&sheet=Tasks
.../exec?token=TOKEN&action=update&sheet=Tasks&row=4&col=Status&value=Done
.../exec?token=TOKEN&action=append&sheet=Tasks&values={"Task":"Ship it","Status":"Todo"}
```

Every response is JSON with an `ok` boolean; failures carry an `error` string.

## Notes

- Writes go through `LockService`, so two concurrent calls can't clobber each
  other.
- `read` returns _displayed_ values — dates and currency come back looking the
  way they look in the sheet, not as raw serial numbers.
- Editing `Code.gs` later doesn't change what's live. Re-deploy via
  **Deploy → Manage deployments → pencil icon → Version: New version**.
