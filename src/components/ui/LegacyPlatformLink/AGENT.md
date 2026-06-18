LegacyPlatformLink is an anchor that points at the legacy platform, building the destination from the API domain plus the redirectPath you supply. It renders as a styled link and accepts standard anchor props.

## When to use

- To send users to a screen that still lives on the legacy platform, such as older dashboards.
- During migration, where some destinations exist only in the legacy product.

## When not to use

- For navigation within the current app; use the router link components instead.
- Once the destination has been migrated; replace the legacy link with an in-app route.

## Do

- Pass only the path portion in redirectPath, such as /v1/dashboard; the domain is added for you.
