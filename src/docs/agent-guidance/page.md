PageContent and PageContentSection are the structural building blocks of a page body. PageContent wraps the whole body and applies the page width cap, while each PageContentSection forms a vertical section that owns the horizontal page padding.

## When to use

- On every authenticated page, directly below the page header, to structure the body.
- To split a page into vertical sections with consistent spacing and padding.

## When not to use

- Inside cards or other components; sections are page-level structure, not generic containers.
- Nested within another PageContentSection.

## Do

- Place all body content inside at least one PageContentSection so page padding stays consistent.
