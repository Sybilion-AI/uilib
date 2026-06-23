Table is a set of semantic primitives — Table, TableHeader, TableBody, TableRow, TableHead, and TableCell — for presenting structured, row-and-column data. Pass size on Table for sm, md, or lg density, and use withBackground and withPaddings when you need a surface and extra edge spacing.

## When to use

- To display structured records where users compare values across rows and columns.
- For datasets small enough to render directly without virtualisation.

## When not to use

- For page or section layout; use the Page layout primitives or CSS grid instead.
- For large datasets that need sorting, filtering, or pagination; build on a data table abstraction.

## Do

- Keep column headers short and use TableHead cells so the markup stays accessible.
- Use size on Table when you need tighter row density.
