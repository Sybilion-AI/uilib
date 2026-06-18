Confirm is a focused confirmation dialog built on Dialog, with a title, body, and paired confirm and cancel actions. Set confirmVariant to destructive for irreversible operations such as deletion.

## When to use

- Before destructive or irreversible actions, such as deleting an item.
- When proceeding would discard unsaved work.

## When not to use

- For routine, easily reversible actions; frequent confirmations train users to click through.
- When the task needs input or several fields; use Dialog instead.

## Do

- Label the confirm button with the action it performs, such as “Delete”, rather than “OK”.
