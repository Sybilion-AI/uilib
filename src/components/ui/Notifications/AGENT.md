Toast stack for transient feedback — warning, danger, and loading states. Mount `NotificationsProvider` once near the app root; call `useNotifications().show()` from any descendant.

## When to use

- Confirm an action completed, such as “Settings saved”.
- Surface non-blocking errors or warnings that do not need a dialog.
- Show a short-lived loading toast while an async operation runs.

## When not to use

- Errors that block the user from continuing; use Dialog or Confirm instead.
- Persistent status that should stay on screen; use Banner or inline alerts.

## Do

- Mount a single `NotificationsProvider` above routes or page content.
- Pass a clear `title`; keep `content` optional and brief.
- Set `autoHide: false` when the toast must stay until the user dismisses it or work finishes.

## Don't

- Mount multiple providers — they share one global store and would duplicate the stack.
- Use for form field validation; show errors next to the field instead.

## API example

```tsx
function SaveButton() {
  const { show, close } = useNotifications();

  async function onSave() {
    const id = show({ type: 'loading', title: 'Saving…', autoHide: false });
    try {
      await save();
      close(id);
      show({ title: 'Saved', content: 'Your changes are live.' });
    } catch {
      close(id);
      show({ type: 'danger', title: 'Save failed', content: 'Try again.' });
    }
  }

  return <Button onClick={onSave}>Save</Button>;
}
```

Wrap the tree once:

```tsx
<NotificationsProvider>
  <AppRoutes />
</NotificationsProvider>
```
