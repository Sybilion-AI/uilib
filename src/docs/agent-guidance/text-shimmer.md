TextShimmer animates a shimmer effect across its text content to signal that an operation is in progress. It keeps the label readable while making the pending state obvious.

## When to use

- To indicate an in-progress operation with a descriptive label, such as “Generating…”.
- For streaming or AI-generated content where text appears gradually.

## When not to use

- As a placeholder for unknown content; use Skeleton instead.
- On static text that is not associated with a loading state, where the animation would mislead.
