# LocalFastUi

## A01. What this project is for

LocalFastUi is a minimal ASP.NET Core app for localhost-only development. It serves a local HTTPS web UI and a few Minimal API endpoints with as little setup and framework overhead as possible.

Use it when you want to build a small local tool with HTML, JavaScript, and a simple backend, without pulling in a larger web application stack. It is meant for developer use on your own machine. It is not a production server.

## B01. What you get

This project uses a slim ASP.NET Core setup with `WebApplication.CreateSlimBuilder`, Kestrel on localhost HTTPS, static files from `wwwroot`, and Minimal API endpoints. The app is intentionally small enough that the main server behavior can stay in a single `Program.cs` file.

The goal is to give you a fast local starting point for browser-based tools that need HTTPS on `localhost`, a static page, and a few backend routes.

## C01. Quick start

From the project directory:

```bash
dotnet restore
dotnet run
```

Open:

```text
https://localhost:7443
```

To run on a different port:

```bash
dotnet run -- --port=8011
```

Quick API checks:

```bash
curl --insecure https://localhost:7443/api/ping
curl --insecure https://localhost:7443/api/info
```

POST example:

```bash
curl --insecure -X POST https://localhost:7443/api/do \
  -H "Content-Type: text/plain" \
  --data "hello from curl"
```

If you use a custom port, replace `7443` with that value.

If the browser shows a certificate warning on first run, that is expected for a local development server until the local dev certificate is trusted.

## E01. What to edit

`Program.cs` contains the server startup code, HTTPS binding, middleware, and API endpoints.

`wwwroot/index.html` is the main page served by the app.

Files under `wwwroot` are the frontend assets for JavaScript, CSS, images, and any additional static content.

## G01. Local certificate notes

If HTTPS is not trusted yet on your machine, check and trust the local development certificate:

```bash
dotnet dev-certs https --check
dotnet dev-certs https --trust
```

For quick command-line testing, you can also use `curl --insecure`.

## J01. Run options and examples

Pass application arguments after `--` when using `dotnet run`.

Run on the default port:

```bash
dotnet run
```

Run on a custom port:

```bash
dotnet run -- --port=8011
```

Build first, then run the built DLL:

```bash
dotnet build
dotnet bin/Debug/<target-framework>/LocalFastUi.dll --port=8011
```

Replace `<target-framework>` with the actual target framework, for example `net8.0`.
