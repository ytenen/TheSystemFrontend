# TheSystem Desktop — macOS Apple Silicon (Tauri 2)

Это оболочка **существующего React/Vite Frontend**. Backend Spring Boot и PostgreSQL запускаются отдельно. Версия оболочки `0.2.0` — не изменение исторического релиза `v0.1.0`.

## Требования

Mac M1, macOS 15, Node/npm, Rust/Cargo (`stable-aarch64-apple-darwin`), Apple Command Line Tools / Xcode. Нужны доступ к npm и crates.io.

## Важное: Backend CORS

Текущий Backend `dev` читает `CORS_ALLOWED_ORIGINS` и по умолчанию разрешает только `http://localhost:5173`. Запускайте Backend с обоими **точными** разрешёнными origin:

```bash
export CORS_ALLOWED_ORIGINS='http://localhost:5173,tauri://localhost'
```

После этого запускайте Backend вашим обычным способом **в том же окружении**. Это не отключает CORS. Проверка preflight при работающем Backend:

```bash
curl -i -X OPTIONS http://localhost:8080/api/player \
 -H 'Origin: tauri://localhost' \
 -H 'Access-Control-Request-Method: GET' \
 -H 'Access-Control-Request-Headers: authorization,accept-language'
```

Ожидается `Access-Control-Allow-Origin: tauri://localhost`. Если реальный WebView присылает другой Origin, его нужно проверить по Network Inspector до любых изменений CORS.

Backend использует PostgreSQL (локально у проекта конфигурация `localhost:5433/thesystem`), который должен быть запущен вместе с Backend. Секреты `DB_PASSWORD` и `JWT_SECRET` храните только в локальном окружении.

## Зависимости и запуск

```bash
git switch feature/tauri-desktop
npm ci
rustup target add aarch64-apple-darwin
VITE_API_BASE_URL=http://localhost:8080 npm run desktop:dev
```

Tauri самостоятельно поднимет Vite на localhost:5173, поэтому отдельно `npm run dev` **не нужен**, иначе порт может быть занят. В браузере продолжит работать `npm run dev` как прежде.

## Проверки и релизная сборка

```bash
npm ci
VITE_API_BASE_URL=http://localhost:8080 npm run build
npm run lint
npm test
cargo check --manifest-path src-tauri/Cargo.toml --target aarch64-apple-darwin
VITE_API_BASE_URL=http://localhost:8080 npm run desktop:build
```

Результаты после успешной сборки обычно находятся в:

```text
src-tauri/target/aarch64-apple-darwin/release/bundle/macos/TheSystem.app
src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/*.dmg
```

Для установки откройте DMG и перетащите TheSystem в `/Applications` либо скопируйте `.app` туда вручную. Для локальной неподписанной сборки может потребоваться однократно подтвердить запуск в **System Settings → Privacy & Security → Open Anyway**, если вы доверяете самостоятельно собранному файлу. Не отключайте Gatekeeper глобально. Apple Developer Account не нужен для личного тестирования.

## Совместимость

- Веб-режим использует `BrowserRouter`, Desktop — `HashRouter` для перезагрузок и переходов в `.app`.
- Запросы Axios, JWT, настройки языка, прогресс Daily/Hidden, Stat XP и загрузка аватаров остаются общими.
- WebView и браузер могут иметь отдельные `localStorage`: при первом запуске потребуется отдельный логин.
- Обе версии работают с **одним** Backend и PostgreSQL; обновление данных происходит через запросы API, а не через локальную синхронизацию.
- Для Desktop не добавлен HTTP plugin, файловый доступ или shell-команды. CSP разрешает соединения только с локальным API.
- Иконки `src-tauri/icons` сгенерированы из **существующего** `public/favicon.svg`, а не из нового логотипа.

## Обновление приложения

После изменений заново выполните `npm ci` и `VITE_API_BASE_URL=http://localhost:8080 npm run desktop:build`. Закройте старую TheSystem.app и замените её в `/Applications`. Автоматического обновления в этом MVP нет.

## Smoke-test перед слиянием

Проверить регистрацию/логин, 401, выход, Hunter Profile, EXP и шесть Stat XP Bars, Daily/Hidden Quests, NOW/TOMORROW Settings, награды, аватар upload/delete, RU/EN и навигацию с перезагрузкой `.app`. Совпадение DTO проверено статически; живые HTTP-тесты требуют запущенных Backend и PostgreSQL.
