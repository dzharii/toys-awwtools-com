using System.Net;
using System.Diagnostics;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateSlimBuilder(args);
var port = builder.Configuration.GetValue("PORT", 7443);
var serverUrl = $"https://localhost:{port}";

builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(options =>
{
    options.TimestampFormat = "HH:mm:ss ";
    options.SingleLine = true;
});
builder.Logging.AddFilter("Microsoft", LogLevel.Warning);
builder.Logging.AddFilter("System", LogLevel.Warning);

builder.WebHost.ConfigureKestrel(kestrel =>
{
    kestrel.AddServerHeader = false;
    kestrel.ListenLocalhost(port, listen =>
    {
        listen.UseHttps();
        listen.Protocols = HttpProtocols.Http1AndHttp2;
    });
});

var app = builder.Build();

app.Lifetime.ApplicationStarted.Register(() =>
{
    app.Logger.LogInformation(
        "Application ready at {Url} in {Environment} (PID {ProcessId})",
        serverUrl,
        app.Environment.EnvironmentName,
        Environment.ProcessId);

    Console.WriteLine($"""

    LocalFastUi is ready
    --------------------
    URL:        {serverUrl}
    Environment:{app.Environment.EnvironmentName}
    PID:        {Environment.ProcessId}
    Endpoints:
      GET  /
      GET  /api/ping
      GET  /api/info
      POST /api/do

    Quick start:
      Open {serverUrl} in a browser
      curl --insecure {serverUrl}/api/ping
      curl --insecure {serverUrl}/api/info
    """);
});

app.Use(async (context, next) =>
{
    var remoteIpAddress = context.Connection.RemoteIpAddress;
    if (remoteIpAddress is not null && !IPAddress.IsLoopback(remoteIpAddress))
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        await context.Response.WriteAsync("Localhost only.");
        return;
    }

    await next();
});

app.Use(async (context, next) =>
{
    if (!context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase))
    {
        await next();
        return;
    }

    var stopwatch = Stopwatch.StartNew();
    try
    {
        await next();
    }
    finally
    {
        stopwatch.Stop();
        app.Logger.LogInformation(
            "Request finished {Method} {Path} -> {StatusCode} in {ElapsedMs:0.000} ms",
            context.Request.Method,
            context.Request.Path.Value,
            context.Response.StatusCode,
            stopwatch.Elapsed.TotalMilliseconds);
    }
});

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/ping", () => Results.Text("ok", "text/plain"));

app.MapPost("/api/do", async (HttpContext context) =>
{
    using var reader = new StreamReader(context.Request.Body);
    var body = await reader.ReadToEndAsync();

    return Results.Json(new
    {
        ok = true,
        length = body.Length,
        utc = DateTimeOffset.UtcNow
    });
});

app.MapGet("/api/info", (IHostEnvironment environment) => Results.Json(new
{
    app = "LocalFastUi",
    environment = environment.EnvironmentName,
    os = Environment.OSVersion.ToString(),
    framework = Environment.Version.ToString(),
    pid = Environment.ProcessId
}));

app.Run();
