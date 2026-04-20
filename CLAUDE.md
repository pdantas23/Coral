# Graphify Integration
Always use the `graphify` tool to maintain a mental map of the project's logic and architecture. This reduces token usage by avoiding redundant re-scans of the entire codebase.

## Graphify Commands
- **Initialize/Sync:** `/Users/philip/Library/Python/3.9/bin/graphify install` (if not configured)
- **Map Context:** When starting a complex task, run `graphify` on the relevant files to extract entities and relations.
- **Query Knowledge:** Use the generated graph to understand dependencies instead of reading every file.

## Guidelines
- Before deep-diving into a new feature, check if a graph already exists.
- Use graphs to explain complex logic flows to the user.