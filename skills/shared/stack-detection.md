## Stack Detection (Shared)
Used by audit-loop.

## Detection Order
1. `package.json` → node (npm/pnpm/yarn)
2. `composer.json` → php (composer)
3. `requirements.txt` / `pyproject.toml` → python (pip/poetry/uv)
4. `go.mod` → go
5. `Cargo.toml` → rust
6. `Gemfile` → ruby
7. `*.csproj` → dotnet

## Per-stack Command Mapping
| Stack | Test | Build | Lint | Format | Type-check |
|-------|------|-------|------|--------|------------|
| **Node** | `npm test` | `npm run build` | `npm run lint` | `npx biome check --write` | `tsc --noEmit` |
| **PHP** | `composer test` | `composer build` | `composer audit` | `vendor/bin/pint` | `vendor/bin/phpstan` |
| **Python** | `pytest` | — | `ruff check --fix` | `ruff format` | `mypy` |
| **Go** | `go test ./...` | `go build ./...` | `go vet` | `gofmt -w` | — |
| **Rust** | `cargo test` | `cargo build` | `cargo clippy --fix` | `cargo fmt` | — |
| **Ruby** | `bundle exec rspec` | — | `rubocop -A` | `rubocop -A` | — |
| **Dotnet** | `dotnet test` | `dotnet build` | `dotnet format` | `dotnet format` | — |

> Load this file from audit-loop or auditor-de-seguridad when stack detection is needed.
