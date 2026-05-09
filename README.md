# SignVault

Cryptographic document signing platform built with SvelteKit, SurrealDB, and JSignPdf.

## Setup

```sh
bun install
```

Copy `.env.example` to `.env` and configure your environment variables.

### Database

Start SurrealDB:

```sh
surreal start --user root --pass root
```

Apply the schema:

```sh
surreal import --conn http://localhost:8000 --user root --pass root --ns signvault --db signvault database.surql
```

### Development

```sh
bun run dev
```

## Tech Stack

- **Frontend**: SvelteKit, Tailwind CSS, shadcn-svelte
- **Database**: SurrealDB
- **PDF Signing**: JSignPdf
- **Email**: SMTP via @upyo
- **Validation**: Zod
