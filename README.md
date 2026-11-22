# Welcome to your Expo app 👋

## Documentação do produto

A documentação funcional e técnica do produto, incluindo evolução, requisitos e diagramas, está disponível em [docs/documentacao-produto.md](docs/documentacao-produto.md).

## Arquitetura e operação

- [Índice da documentação](docs/README.md)
- [Compose local](docker-compose.yml): copie `.env.example` para `.env`, substitua os valores locais e execute `docker compose up --build`. Nginx routes the API to Users, Catalog, Cart, and Orders services, each with its own MySQL database.

Set `EXPO_PUBLIC_API_URL` in `.env` to the Nginx host/port reachable from the Expo runtime (the example uses a LAN address on port 8080). The service schemas are initialized on fresh Docker volumes. Existing data in the previous shared database is not migrated automatically; back up and export/import it before switching a populated deployment to this Compose setup. Do not remove persistent volumes to troubleshoot an existing deployment.

To restore catalog data from the previous MySQL database, start the Compose stack and run `npm --prefix .backend run migrate:catalog`. The migration reads `LEGACY_DB_HOST`, `LEGACY_DB_PORT`, `LEGACY_DB_USER`, `LEGACY_DB_PASSWORD`, and `LEGACY_DB_NAME` (defaults target a local legacy MySQL database named `projeto22026`) and writes through the local Catalog database port `CATALOG_DB_PORT` (default `3307`). It copies products, categories, and category links without clearing either database. Back up the source and verify the counts before and after migration.

O deploy de produção é manual por GitHub Actions e requer o ambiente `production`, os segredos SSH documentados no workflow e uma cópia configurada do repositório em `/opt/proj214k` no host.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
