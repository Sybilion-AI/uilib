---
summary: Validated forms via root Form with zod schema and inline field errors
---

Root `<Form>` owns schema validation, default values, and submit handling — it wraps react-hook-form and zodResolver internally and renders the native `<form>` element. Pair field primitives with uilib controls for inline validation errors.

## When to use

- Demo forms validated with a zod schema.
- Controls that need `Controller` wiring (Select, Checkbox, custom inputs).
- Inline field errors after submit or blur.

## When not to use

- Simple label-plus-input rows without validation — use `LabeledInput`.
- Page-level or session errors — use `Banner`.
- Success or info feedback — use Sonner toasts, not field errors.

## Do

- Pass `schema`, `defaultValues`, and `onSubmit` to the root `Form`.
- Wrap each control in `FormControl` inside `FormItem`.
- Show validation messages with `FormMessage`.

## Don't

- Call `useForm` or `zodResolver` in page code — the root `Form` handles that.
- Use `toast.error` for field validation failures.
- Render manual error `<p>` elements outside `FormMessage`.
