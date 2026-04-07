const statusNode = document.querySelector("#status");
const outputNode = document.querySelector("#output");
const runCheckButton = document.querySelector("#run-check");
const sendPostButton = document.querySelector("#send-post");
const clearOutputButton = document.querySelector("#clear-output");
const toolNameInput = document.querySelector("#tool-name");
const postRouteInput = document.querySelector("#post-route");
const postBodyInput = document.querySelector("#post-body");
const baseUrlNode = document.querySelector("#base-url");
const apiUrlNode = document.querySelector("#api-url");
const pingCommandNode = document.querySelector("#cmd-ping");
const infoCommandNode = document.querySelector("#cmd-info");
const doCommandNode = document.querySelector("#cmd-do");

const baseUrl = window.location.origin;
const apiBaseUrl = `${baseUrl}/api`;

function setText(node, value) {
  if (node) {
    node.textContent = value;
  }
}

function setStatus(message, state = "idle") {
  if (!statusNode) {
    return;
  }

  statusNode.textContent = message;
  statusNode.dataset.state = state;
}

function renderOutput(value) {
  if (!outputNode) {
    return;
  }

  outputNode.textContent =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function getWorkspaceName() {
  return toolNameInput?.value.trim() || "Starter workspace";
}

function normalizeRoute(route) {
  if (!route) {
    return "/api/do";
  }

  const trimmed = route.trim();
  if (!trimmed) {
    return "/api/do";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function toAbsoluteUrl(route) {
  const normalizedRoute = normalizeRoute(route);
  if (normalizedRoute.startsWith("http://") || normalizedRoute.startsWith("https://")) {
    return normalizedRoute;
  }

  return `${baseUrl}${normalizedRoute}`;
}

function updateCommandText() {
  setText(baseUrlNode, baseUrl);
  setText(apiUrlNode, apiBaseUrl);
  setText(pingCommandNode, `curl --insecure ${apiBaseUrl}/ping`);
  setText(infoCommandNode, `curl --insecure ${apiBaseUrl}/info`);
  setText(
    doCommandNode,
    `curl --insecure -X POST ${toAbsoluteUrl(postRouteInput?.value)} \\\n` +
      `  -H "Content-Type: text/plain" \\\n` +
      `  --data "hello from curl"`
  );
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function runApiCheck() {
  setStatus("Requesting /api/info and /api/ping...", "loading");

  try {
    const [infoResponse, pingResponse] = await Promise.all([
      fetch("/api/info"),
      fetch("/api/ping")
    ]);

    if (!infoResponse.ok || !pingResponse.ok) {
      throw new Error(`Unexpected status codes: ${infoResponse.status} and ${pingResponse.status}`);
    }

    const info = await infoResponse.json();
    const ping = await pingResponse.text();

    renderOutput({
      workspace: getWorkspaceName(),
      ping,
      info,
      baseUrl,
      apiBaseUrl
    });
    setStatus("GET check complete.", "success");
  } catch (error) {
    renderOutput({
      error: error instanceof Error ? error.message : String(error)
    });
    setStatus("GET check failed.", "error");
  }
}

async function sendSamplePost() {
  const route = normalizeRoute(postRouteInput?.value);
  const body = postBodyInput?.value ?? "";

  setStatus(`Sending POST request to ${route}...`, "loading");

  try {
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body
    });

    const responseBody = await parseResponse(response);
    if (!response.ok) {
      throw new Error(
        `POST ${route} failed with ${response.status} ${response.statusText}`
      );
    }

    renderOutput({
      workspace: getWorkspaceName(),
      request: {
        route,
        bodyLength: body.length
      },
      response: responseBody
    });
    setStatus("POST request complete.", "success");
  } catch (error) {
    renderOutput({
      route,
      error: error instanceof Error ? error.message : String(error)
    });
    setStatus("POST request failed.", "error");
  }
}

runCheckButton?.addEventListener("click", () => {
  void runApiCheck();
});

sendPostButton?.addEventListener("click", () => {
  void sendSamplePost();
});

clearOutputButton?.addEventListener("click", () => {
  renderOutput({
    cleared: true,
    nextStep: "Run the API check or send a sample POST."
  });
  setStatus("Output cleared.", "idle");
});

postRouteInput?.addEventListener("input", updateCommandText);

updateCommandText();
