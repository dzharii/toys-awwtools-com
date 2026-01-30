(() => {
  const DEBUG = true;

  const GUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const PRINCIPALS = [
    { key: "user", label: "a user (human)", isManagedIdentity: false },
    { key: "group", label: "a group", isManagedIdentity: false },
    { key: "servicePrincipal", label: "a service principal (app registration)", isManagedIdentity: false },
    { key: "managedIdentitySystemAssigned", label: "a system-assigned managed identity", isManagedIdentity: true },
    { key: "managedIdentityUserAssigned", label: "a user-assigned managed identity", isManagedIdentity: true },
    { key: "workloadIdentity", label: "a workload identity (OIDC federation)", isManagedIdentity: false }
  ];

  const INTERACTIVE_PRINCIPALS = new Set(["user", "group"]);

  const WORKLOADS = [
    { key: "functions", label: "Azure Functions" },
    { key: "appservice", label: "Azure App Service" },
    { key: "vm", label: "VM or VM scale set" },
    { key: "aks", label: "AKS" },
    { key: "logicapps", label: "Logic Apps" },
    { key: "cicd", label: "CI/CD pipeline" },
    { key: "other", label: "Other" }
  ];

  const ACCESS_METHODS = [
    { key: "portal", label: "Azure portal" },
    { key: "cli", label: "Azure CLI" },
    { key: "powershell", label: "Azure PowerShell" },
    { key: "sdk", label: "SDK or code on my machine" },
    { key: "cicd", label: "CI/CD pipeline" },
    { key: "other", label: "Other" }
  ];

  const PRINCIPAL_ID_SOURCES = [
    { key: "paste", label: "Paste principalId" },
    { key: "bicep", label: "From an existing resource in this Bicep template" }
  ];

  const INTENTS = [
    { key: "read", label: "read data", intentType: "data" },
    { key: "write", label: "write data", intentType: "data" },
    { key: "admin", label: "administer access or data", intentType: "data" },
    { key: "manage", label: "manage the Azure resource (settings)", intentType: "management" }
  ];

  const SUBSCRIPTIONS = [
    { key: "same", label: "my current subscription" },
    { key: "cross", label: "a different subscription" }
  ];

  const SERVICES = {
    "storage.blob": {
      label: "Azure Storage (Blob / ADLS Gen2)",
      scopes: [
        { key: "container", label: "specific container", scopeSummary: "container", nameNoun: "container" },
        { key: "account", label: "storage account", scopeSummary: "storage account", nameNoun: "storage account" },
        { key: "resourceGroup", label: "resource group", scopeSummary: "resource group", nameNoun: "resource group" }
      ],
      defaultScope: "container",
      roles: {
        data: {
          read: "Storage Blob Data Reader",
          write: "Storage Blob Data Contributor",
          admin: "Storage Blob Data Owner"
        },
        management: "Contributor"
      },
      portalNote: "If a human tests access in the Azure portal, add Reader on the storage account so the portal can show the resource without granting data access.",
      nonRbacNetwork: true
    },
    "storage.files": {
      label: "Azure Storage (Files)",
      scopes: [
        { key: "share", label: "specific file share", scopeSummary: "file share", nameNoun: "file share" },
        { key: "account", label: "storage account", scopeSummary: "storage account", nameNoun: "storage account" }
      ],
      defaultScope: "share",
      roles: {
        data: {
          read: "Storage File Data SMB Share Reader",
          write: "Storage File Data SMB Share Contributor",
          admin: "Storage File Data SMB Share Elevated Contributor"
        },
        management: "Contributor"
      },
      serviceNote: "Azure Files access often depends on identity integration and SMB semantics. This tool selects roles and scope, but it does not configure identity-based access.",
      nonRbacNetwork: true
    },
    "keyvault.secrets": {
      label: "Azure Key Vault (Secrets)",
      scopes: [
        { key: "vault", label: "vault", scopeSummary: "vault", nameNoun: "vault" },
        { key: "resourceGroup", label: "resource group", scopeSummary: "resource group", nameNoun: "resource group" }
      ],
      defaultScope: "vault",
      roles: {
        data: {
          read: "Key Vault Secrets User",
          write: "Key Vault Secrets Officer",
          admin: "Key Vault Administrator"
        },
        management: "Key Vault Contributor"
      },
      warning: "Key Vault has two permission models. These roles apply only when the vault uses Azure role-based access control. If the vault uses access policies, grant permissions via access policies instead.",
      nonRbacNetwork: true
    },
    "servicebus": {
      label: "Azure Service Bus",
      scopes: [
        { key: "queue", label: "specific queue", scopeSummary: "queue", nameNoun: "queue" },
        { key: "topic", label: "specific topic", scopeSummary: "topic", nameNoun: "topic" },
        { key: "subscription", label: "topic subscription", scopeSummary: "topic subscription", nameNoun: "topic subscription" },
        { key: "namespace", label: "namespace", scopeSummary: "namespace", nameNoun: "namespace" }
      ],
      defaultScope: "queue",
      roles: {
        data: {
          read: "Azure Service Bus Data Receiver",
          write: "Azure Service Bus Data Sender",
          admin: "Azure Service Bus Data Owner"
        },
        management: "Contributor"
      },
      nonRbacNetwork: true
    },
    "eventhubs": {
      label: "Azure Event Hubs",
      scopes: [
        { key: "eventhub", label: "specific event hub", scopeSummary: "event hub", nameNoun: "event hub" },
        { key: "consumergroup", label: "consumer group", scopeSummary: "consumer group", nameNoun: "consumer group" },
        { key: "namespace", label: "namespace", scopeSummary: "namespace", nameNoun: "namespace" }
      ],
      defaultScope: "eventhub",
      roles: {
        data: {
          read: "Azure Event Hubs Data Receiver",
          write: "Azure Event Hubs Data Sender",
          admin: "Azure Event Hubs Data Owner"
        },
        management: "Contributor"
      },
      nonRbacNetwork: true
    },
    "kusto": {
      label: "Azure Data Explorer (Kusto)",
      scopes: [
        { key: "database", label: "specific database", scopeSummary: "database", nameNoun: "database" },
        { key: "cluster", label: "cluster", scopeSummary: "cluster", nameNoun: "cluster" }
      ],
      defaultScope: "database",
      roles: {
        data: {
          read: "Kusto Viewer",
          write: "Kusto Ingestor",
          admin: "Kusto Admin"
        },
        management: "Contributor"
      },
      roleFamilySummary: "Kusto database role (Viewer / Ingestor / Admin)",
      warning: "Kusto uses service-specific security roles and a dedicated permission blade. Expect the steps to differ from generic IAM-only flows.",
      nonRbacNetwork: false
    },
    "cosmos": {
      label: "Azure Cosmos DB for NoSQL (data plane)",
      scopes: [
        { key: "account", label: "Cosmos account", scopeSummary: "account", nameNoun: "Cosmos account" }
      ],
      defaultScope: "account",
      roles: {
        data: {
          read: "Cosmos DB data plane role (reader)",
          write: "Cosmos DB data plane role (contributor)",
          admin: "Cosmos DB data plane role (admin)"
        },
        management: "Contributor-type management role (Cosmos DB)"
      },
      roleFamilySummary: "Cosmos DB data plane role (reader / contributor / admin)",
      warning: "Cosmos DB data plane RBAC uses its own role definitions and assignments. You may need a built-in or custom role definition that matches your API and scenario.",
      nonRbacNetwork: false
    }
  };

  const SERVICE_OPTIONS = [
    { key: "storage.blob", label: SERVICES["storage.blob"].label },
    { key: "storage.files", label: SERVICES["storage.files"].label },
    { key: "keyvault.secrets", label: SERVICES["keyvault.secrets"].label },
    { key: "servicebus", label: SERVICES["servicebus"].label },
    { key: "eventhubs", label: SERVICES["eventhubs"].label },
    { key: "kusto", label: SERVICES["kusto"].label },
    { key: "cosmos", label: SERVICES["cosmos"].label }
  ];

  const ROLE_DEFINITION_IDS = {
    "Storage Blob Data Reader": "2a2b9908-6ea1-4ae2-8e65-a410df84e7d1",
    "Storage Blob Data Contributor": "ba92f5b4-2d11-453d-a403-e96b0029c9fe",
    "Storage Blob Data Owner": "b7e6dc6d-f1e8-4753-8033-0f276bb0955b",
    "Storage File Data SMB Share Reader": null,
    "Storage File Data SMB Share Contributor": null,
    "Storage File Data SMB Share Elevated Contributor": null,
    "Key Vault Secrets User": "4633458b-17de-408a-b874-0445c86b69e6",
    "Key Vault Secrets Officer": "b86a8fe4-44ce-4948-aee5-eccb2c155cd7",
    "Key Vault Administrator": "00482a5a-887f-4fb3-b363-3b7fe8e74483",
    "Azure Service Bus Data Receiver": "4f6d3b9b-027b-4f4c-9142-0e5a2a2247e0",
    "Azure Service Bus Data Sender": "69a216fc-b8fb-44d8-bc22-1f3c2cd27a39",
    "Azure Service Bus Data Owner": "090c5cfd-751d-490a-894a-3ce6f1109419",
    "Azure Event Hubs Data Receiver": "a638d3c7-ab3a-418d-83e6-5f17a39d4fde",
    "Azure Event Hubs Data Sender": "2b629674-e913-4c01-ae53-ef4638d8f975",
    "Azure Event Hubs Data Owner": "f526a384-b230-433a-b45c-95f59c4a2dec",
    "Reader": "acdd72a7-3385-48ef-bd42-f606fba81ae7",
    "Owner": "8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
    "Role Based Access Control Administrator": "f58310d9-a9f6-439a-9e8d-f62e7b41a168",
    "User Access Administrator": "18d7d88d-d35e-4fb5-a5c3-7773c20a72d9",
    "Contributor": "b24988ac-6180-42a0-ab88-20f7382dd24c"
  };

  const DEFAULTS = {
    principal: "managedIdentityUserAssigned",
    workload: "functions",
    accessMethod: "portal",
    intent: "read",
    service: "storage.blob",
    subscriptionRelation: "same",
    scope: "",
    targetName: "",
    mySubscriptionId: "",
    targetSubscriptionId: "",
    principalIdSource: "paste",
    principalId: "",
    principalIdExpression: "",
    resourceGroupName: "",
    scopeResourceId: "",
    storageAccountName: "",
    containerName: "",
    fileShareName: "",
    vaultName: "",
    serviceBusNamespace: "",
    serviceBusQueue: "",
    serviceBusTopic: "",
    serviceBusSubscription: "",
    eventHubsNamespace: "",
    eventHubName: "",
    eventHubConsumerGroup: ""
  };

  const state = { ...DEFAULTS };

  const elements = {
    principal: document.getElementById("principal"),
    workload: document.getElementById("workload"),
    accessMethod: document.getElementById("accessMethod"),
    intent: document.getElementById("intent"),
    service: document.getElementById("service"),
    subscriptionRelation: document.getElementById("subscriptionRelation"),
    scope: document.getElementById("scope"),
    scopeWrapper: document.getElementById("scope").closest(".control-inline"),
    targetName: document.getElementById("targetName"),
    mySubscriptionId: document.getElementById("mySubscriptionId"),
    targetSubscriptionId: document.getElementById("targetSubscriptionId"),
    principalIdSource: document.getElementById("principalIdSource"),
    principalId: document.getElementById("principalId"),
    principalIdExpression: document.getElementById("principalIdExpression"),
    principalIdExpressionField: document.getElementById("principalIdExpressionField"),
    principalIdField: document.getElementById("principalIdField"),
    resourceGroupName: document.getElementById("resourceGroupName"),
    scopeResourceId: document.getElementById("scopeResourceId"),
    storageAccountName: document.getElementById("storageAccountName"),
    containerName: document.getElementById("containerName"),
    fileShareName: document.getElementById("fileShareName"),
    vaultName: document.getElementById("vaultName"),
    serviceBusNamespace: document.getElementById("serviceBusNamespace"),
    serviceBusQueue: document.getElementById("serviceBusQueue"),
    serviceBusTopic: document.getElementById("serviceBusTopic"),
    serviceBusSubscription: document.getElementById("serviceBusSubscription"),
    eventHubsNamespace: document.getElementById("eventHubsNamespace"),
    eventHubName: document.getElementById("eventHubName"),
    eventHubConsumerGroup: document.getElementById("eventHubConsumerGroup"),
    serviceIdentifiers: document.getElementById("serviceIdentifiers"),
    crossFields: document.getElementById("crossFields"),
    suggestedRole: document.getElementById("suggestedRole"),
    summaryLine: document.getElementById("summaryLine"),
    summaryNote: document.getElementById("summaryNote"),
    suggestedHint: document.getElementById("suggestedHint"),
    guidanceBody: document.getElementById("guidanceBody"),
    guidanceRecap: null,
    guidanceScope: null,
    guidanceSteps: null,
    guidanceValidation: null,
    guidanceCallouts: null,
    exampleWarnings: null,
    psPreface: null,
    bicepCrossWarning: null,
    bicepPreface: null,
    codePowerShell: null,
    codeBicep: null,
    diagramCanvas: document.getElementById("diagramCanvas"),
    diagramResize: document.getElementById("diagramResize"),
    diagramAlt: document.getElementById("diagramAlt")
  };

  function logDebug(label, payload) {
    if (!DEBUG) return;
    const stamp = new Date().toISOString();
    console.log(`[CalmRBAC ${stamp}] ${label}`, payload);
  }

  function buildOptions(selectEl, options, selectedKey) {
    selectEl.innerHTML = "";
    options.forEach(option => {
      const opt = document.createElement("option");
      opt.value = option.key;
      opt.textContent = option.label;
      if (option.key === selectedKey) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function getService(key) {
    return SERVICES[key] || SERVICES["storage.blob"];
  }

  function getIntent(key) {
    return INTENTS.find(intent => intent.key === key) || INTENTS[0];
  }

  function getPrincipal(key) {
    return PRINCIPALS.find(principal => principal.key === key) || PRINCIPALS[0];
  }

  function getAccessMethodLabel(key) {
    const method = ACCESS_METHODS.find(item => item.key === key);
    return method ? method.label : key;
  }

  function getWorkloadLabel(workloadKey) {
    const workload = WORKLOADS.find(item => item.key === workloadKey);
    return workload ? workload.label : workloadKey;
  }

  function getScopeOption(serviceKey, scopeKey) {
    const service = getService(serviceKey);
    return service.scopes.find(scope => scope.key === scopeKey) || service.scopes[0];
  }

  function getPrincipalCategory(key) {
    return INTERACTIVE_PRINCIPALS.has(key) ? "interactive" : "application";
  }

  function getPrincipalTypeLabel(key) {
    switch (key) {
      case "user":
        return "User";
      case "group":
        return "Group";
      case "servicePrincipal":
        return "Service principal";
      case "managedIdentitySystemAssigned":
      case "managedIdentityUserAssigned":
        return "Managed identity";
      case "workloadIdentity":
        return "Workload identity";
      default:
        return "Principal";
    }
  }

  function getPrincipalTypeForBicep(key) {
    switch (key) {
      case "user":
        return "User";
      case "group":
        return "Group";
      case "servicePrincipal":
      case "managedIdentitySystemAssigned":
      case "managedIdentityUserAssigned":
      case "workloadIdentity":
        return "ServicePrincipal";
      default:
        return "ServicePrincipal";
    }
  }

  function getRoleDefinitionId(roleName) {
    return ROLE_DEFINITION_IDS[roleName] || "";
  }

  function setState(patch) {
    Object.assign(state, patch);
    logDebug("state:update", { ...state });
    render();
  }

  function validateGuid(value) {
    if (!value) return false;
    return GUID_PATTERN.test(value.trim());
  }

  function derive() {
    const service = getService(state.service);
    const intent = getIntent(state.intent);
    const principal = getPrincipal(state.principal);
    const scope = getScopeOption(state.service, state.scope);
    const principalCategory = getPrincipalCategory(state.principal);

    const isCross = state.subscriptionRelation === "cross";
    const mySubValid = validateGuid(state.mySubscriptionId);
    const targetSubValid = validateGuid(state.targetSubscriptionId);
    const missingCrossIds = isCross && (!state.mySubscriptionId.trim() || !state.targetSubscriptionId.trim());
    const invalidCrossIds = isCross && ((state.mySubscriptionId.trim() && !mySubValid) || (state.targetSubscriptionId.trim() && !targetSubValid));

    const intentType = intent.intentType;
    let missingMapping = false;
    let roleName = "";
    let roleSummary = "";
    let roleDefinitionId = "";
    let isRoleFamily = false;

    if (intentType === "management") {
      if (!service.roles.management) {
        missingMapping = true;
      } else {
        roleName = service.roles.management;
        roleSummary = roleName;
        roleDefinitionId = getRoleDefinitionId(roleName);
        if (service.roleFamilySummary && service.roles.management.includes("Contributor-type")) {
          isRoleFamily = true;
        }
      }
    } else {
      if (!service.roles.data[state.intent]) {
        missingMapping = true;
      } else {
        roleName = service.roles.data[state.intent];
        roleSummary = roleName;
        roleDefinitionId = getRoleDefinitionId(roleName);
        if (service.roleFamilySummary && (state.service === "kusto" || state.service === "cosmos")) {
          isRoleFamily = true;
          roleSummary = service.roleFamilySummary;
        }
      }
    }

    logDebug("derive", {
      service: service.label,
      intent: intent.label,
      principal: principal.label,
      scope: scope.label,
      isCross,
      missingCrossIds,
      invalidCrossIds,
      roleName,
      roleSummary,
      roleDefinitionId,
      isRoleFamily,
      missingMapping,
      principalCategory
    });

    return {
      service,
      intent,
      principal,
      scope,
      principalCategory,
      isCross,
      missingCrossIds,
      invalidCrossIds,
      mySubValid,
      targetSubValid,
      roleName,
      roleSummary,
      roleDefinitionId,
      isRoleFamily,
      missingMapping
    };
  }

  function markCompletion() {
    document.querySelectorAll(".control-inline, .control-block").forEach(wrapper => {
      const input = wrapper.querySelector("select, input");
      if (!input) return;
      const defaultValue = wrapper.dataset.default;
      const isComplete = defaultValue !== undefined && input.value !== defaultValue && input.value !== "";
      wrapper.classList.toggle("is-complete", isComplete);
    });
  }

  function updateCrossFields(isCross) {
    if (isCross) {
      elements.crossFields.classList.add("is-visible");
      elements.crossFields.setAttribute("aria-hidden", "false");
    } else {
      elements.crossFields.classList.remove("is-visible");
      elements.crossFields.setAttribute("aria-hidden", "true");
    }
  }

  function updateInvalidStates(derived) {
    const myInput = elements.mySubscriptionId;
    const targetInput = elements.targetSubscriptionId;
    const myHasValue = !!state.mySubscriptionId.trim();
    const targetHasValue = !!state.targetSubscriptionId.trim();

    myInput.classList.toggle("is-invalid", derived.isCross && myHasValue && !derived.mySubValid);
    targetInput.classList.toggle("is-invalid", derived.isCross && targetHasValue && !derived.targetSubValid);

    myInput.setAttribute("aria-invalid", derived.isCross && myHasValue && !derived.mySubValid ? "true" : "false");
    targetInput.setAttribute("aria-invalid", derived.isCross && targetHasValue && !derived.targetSubValid ? "true" : "false");
  }

  function updateNarrativeVisibility(derived) {
    const showAccess = derived.principalCategory === "interactive";
    const showWorkload = derived.principalCategory === "application";
    document.querySelectorAll("[data-visibility='access']").forEach(node => {
      node.classList.toggle("is-hidden", !showAccess);
    });
    document.querySelectorAll("[data-visibility='workload']").forEach(node => {
      node.classList.toggle("is-hidden", !showWorkload);
    });
  }

  function updatePrincipalIdSource() {
    const isBicepSource = state.principalIdSource === "bicep";
    elements.principalIdExpressionField.classList.toggle("is-hidden", !isBicepSource);
  }

  function updateIdentifierFields(derived) {
    const serviceKey = state.service;
    const scopeKey = derived.scope.key;
    const scopeOverrideValid = looksLikeResourceId(state.scopeResourceId);

    if (elements.serviceIdentifiers) {
      elements.serviceIdentifiers.classList.toggle("is-deemphasized", scopeOverrideValid);
      const fields = elements.serviceIdentifiers.querySelectorAll(".field");
      fields.forEach(field => {
        const services = (field.dataset.services || "").split(" ").filter(Boolean);
        const scopes = (field.dataset.scopes || "").split(" ").filter(Boolean);
        const matchesService = services.length === 0 || services.includes(serviceKey);
        const matchesScope = scopes.length === 0 || scopes.includes(scopeKey);
        field.classList.toggle("is-hidden", !(matchesService && matchesScope));
      });
    }
  }

  function looksLikeResourceId(value) {
    if (!value) return false;
    const trimmed = value.trim();
    return /^\/subscriptions\/[0-9a-fA-F-]{8,}\/resourceGroups\//.test(trimmed) || /^\/subscriptions\/[0-9a-fA-F-]{8,}\//.test(trimmed);
  }

  function autoSizeInlineSelects() {
    const measure = autoSizeInlineSelects.measureSpan || (() => {
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.visibility = "hidden";
      span.style.whiteSpace = "pre";
      span.style.left = "-9999px";
      span.style.top = "-9999px";
      document.body.appendChild(span);
      autoSizeInlineSelects.measureSpan = span;
      return span;
    })();

    const minWidth = 160;
    const maxWidth = 240;
    document.querySelectorAll(".control-inline select").forEach(select => {
      const selected = select.options[select.selectedIndex];
      const text = selected ? selected.text : "";
      const style = window.getComputedStyle(select);
      measure.style.font = style.font;
      measure.textContent = text;
      const width = Math.min(maxWidth, Math.max(minWidth, measure.getBoundingClientRect().width + 40));
      select.style.width = `${Math.round(width)}px`;
    });
  }

  function buildScenarioRecap(derived) {
    const { service, intent, principal, scope } = derived;
    const relation = derived.isCross ? "a different subscription" : "the current subscription";
    const scopeText = state.targetName.trim()
      ? `at the ${scope.nameNoun} ${wrapCode(state.targetName.trim())}`
      : `at the ${scope.scopeSummary} scope`;

    let crossPhrase = relation;
    if (derived.isCross && derived.targetSubValid) {
      crossPhrase = `a different subscription (${wrapCode(state.targetSubscriptionId.trim())})`;
    }

    if (derived.principalCategory === "interactive") {
      return `Granting access to ${principal.label}. Access will be used via ${getAccessMethodLabel(state.accessMethod)} to ${intent.label} from ${service.label} in ${crossPhrase}, ${scopeText}.`;
    }
    return `Granting access to ${principal.label} used by ${getWorkloadLabel(state.workload)}. The workload needs to ${intent.label} from ${service.label} in ${crossPhrase}, ${scopeText}.`;
  }

  function wrapCode(text) {
    return `<span class="inline-code">${escapeHtml(text)}</span>`;
  }

  function termChip(text) {
    return `<span class="term-chip">${escapeHtml(text)}</span>`;
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function getIntentActionWord(intentKey) {
    switch (intentKey) {
      case "read":
        return "read";
      case "write":
        return "write";
      case "admin":
      case "manage":
        return "read or write";
      default:
        return "read";
    }
  }

  function getScopeMapping(derived) {
    const scopeKey = derived.scope.key;
    const scopeNoun = derived.scope.nameNoun || derived.scope.scopeSummary;
    const defaultLabel = termChip(scopeNoun);
    const fallback = {
      label: defaultLabel,
      short: "assignment created at that scope",
      detail: `The role assignment is created on the ${defaultLabel}.`
    };

    switch (state.service) {
      case "storage.blob":
        if (scopeKey === "container") {
          return {
            label: termChip("container"),
            short: "assignment created on the container",
            detail: `Specific ${termChip("container")} means the role assignment is created on the ${termChip("container")}, not the ${termChip("storage account")}.`
          };
        }
        if (scopeKey === "account") {
          return {
            label: termChip("storage account"),
            short: "assignment created on the storage account",
            detail: `Storage account means the role assignment is created on the ${termChip("storage account")}, not the ${termChip("resource group")}.`
          };
        }
        if (scopeKey === "resourceGroup") {
          return {
            label: termChip("resource group"),
            short: "assignment created on the resource group",
            detail: `Resource group means the role assignment is created on the ${termChip("resource group")} that contains the storage account.`
          };
        }
        return fallback;
      case "storage.files":
        if (scopeKey === "share") {
          return {
            label: termChip("file share"),
            short: "assignment created on the file share",
            detail: `Specific ${termChip("file share")} means the role assignment is created on the ${termChip("file share")}, not the ${termChip("storage account")}.`
          };
        }
        if (scopeKey === "account") {
          return {
            label: termChip("storage account"),
            short: "assignment created on the storage account",
            detail: `Storage account means the role assignment is created on the ${termChip("storage account")}, not the ${termChip("resource group")}.`
          };
        }
        return fallback;
      case "keyvault.secrets":
        if (scopeKey === "vault") {
          return {
            label: termChip("vault"),
            short: "assignment created on the vault",
            detail: `Vault means the role assignment is created on the ${termChip("vault")}, not the ${termChip("resource group")}.`
          };
        }
        if (scopeKey === "resourceGroup") {
          return {
            label: termChip("resource group"),
            short: "assignment created on the resource group",
            detail: `Resource group means the role assignment is created on the ${termChip("resource group")} that contains the vault.`
          };
        }
        return fallback;
      case "servicebus":
        if (scopeKey === "queue") {
          return {
            label: termChip("queue"),
            short: "assignment created on the queue",
            detail: `Queue means the role assignment is created on that ${termChip("queue")}, not the ${termChip("namespace")}.`
          };
        }
        if (scopeKey === "topic") {
          return {
            label: termChip("topic"),
            short: "assignment created on the topic",
            detail: `Topic means the role assignment is created on that ${termChip("topic")}, not the ${termChip("namespace")}.`
          };
        }
        if (scopeKey === "subscription") {
          return {
            label: termChip("topic subscription"),
            short: "assignment created on the topic subscription",
            detail: `Topic subscription means the role assignment is created on the ${termChip("topic subscription")} under the ${termChip("topic")}, not the ${termChip("namespace")}.`
          };
        }
        if (scopeKey === "namespace") {
          return {
            label: termChip("namespace"),
            short: "assignment created on the namespace",
            detail: `Namespace means the role assignment is created on the ${termChip("namespace")} and applies to queues and topics within it.`
          };
        }
        return fallback;
      case "eventhubs":
        if (scopeKey === "eventhub") {
          return {
            label: termChip("event hub"),
            short: "assignment created on the event hub",
            detail: `Event hub means the role assignment is created on that ${termChip("event hub")}, not the ${termChip("namespace")}.`
          };
        }
        if (scopeKey === "consumergroup") {
          return {
            label: termChip("consumer group"),
            short: "assignment created on the consumer group",
            detail: `Consumer group means the role assignment is created on the ${termChip("consumer group")}, not the ${termChip("event hub")} or ${termChip("namespace")}.`
          };
        }
        if (scopeKey === "namespace") {
          return {
            label: termChip("namespace"),
            short: "assignment created on the namespace",
            detail: `Namespace means the role assignment is created on the ${termChip("namespace")} and applies to event hubs within it.`
          };
        }
        return fallback;
      case "kusto":
        if (scopeKey === "database") {
          return {
            label: termChip("database"),
            short: "assignment created on the database",
            detail: `Database means the role assignment is created on the ${termChip("database")}, not the ${termChip("cluster")}.`
          };
        }
        if (scopeKey === "cluster") {
          return {
            label: termChip("cluster"),
            short: "assignment created on the cluster",
            detail: `Cluster means the role assignment is created on the ${termChip("cluster")}.`
          };
        }
        return fallback;
      case "cosmos":
        if (scopeKey === "account") {
          return {
            label: termChip("Cosmos account"),
            short: "assignment created on the Cosmos account",
            detail: `Cosmos account means the role assignment is created on the ${termChip("Cosmos account")}.`
          };
        }
        return fallback;
      default:
        return fallback;
    }
  }

  function buildScopeSummary(derived) {
    const mapping = getScopeMapping(derived);
    return `${mapping.label} — ${mapping.short}`;
  }

  function buildScopeNotes(derived) {
    const mapping = getScopeMapping(derived);
    return `Scope determines where the permission applies. Narrower scope means less access. ${mapping.detail}`;
  }

  function buildSteps(derived) {
    const steps = [];
    if (derived.isCross && (derived.missingCrossIds || derived.invalidCrossIds)) {
      steps.push(`Step 1: Open the target resource in the ${termChip("Azure portal")}.`);
    } else {
      const subscriptionPhrase = derived.isCross ? "target subscription" : "current subscription";
      steps.push(`Step 1: Open the target resource in the ${termChip("Azure portal")} in the ${subscriptionPhrase}.`);
    }
    const roleName = derived.isRoleFamily ? derived.roleSummary : derived.roleName;
    const memberLabel = derived.principal.isManagedIdentity ? "Managed identity" : getPrincipalTypeLabel(derived.principal.key);
    steps.push(`Step 2: Open ${termChip("Access control (IAM)")} and choose ${termChip("Add role assignment")}.`);
    steps.push(`Step 3: In ${termChip("Role")}, select ${termChip(roleName)}.`);
    steps.push(`Step 4: In ${termChip("Members")}, select ${termChip(memberLabel)} and choose the specific principal instance. Confirm the assignment.`);
    steps.push(`Step 5: Validate with a minimal action: perform a single small ${getIntentActionWord(derived.intent.key)} operation against the target.`);
    return steps;
  }

  function buildValidationSentence(derived) {
    return `Validation should be quick and reversible. Stop after one successful ${getIntentActionWord(derived.intent.key)} operation.`;
  }

  function buildCallouts(derived) {
    const callouts = [];

    if (derived.missingMapping && derived.intent.intentType === "management") {
      callouts.push({
        type: "warning",
        icon: "⚠️",
        text: "This intent requires management-plane guidance. This service entry does not define a management-plane role mapping. Choose a data intent or extend the catalog."
      });
    }

    if (derived.missingMapping) {
      callouts.push({
        type: "warning",
        icon: "⚠️",
        text: "This intent does not have a defined role mapping. Choose another intent or extend the catalog."
      });
    }

    if (derived.isCross && (derived.missingCrossIds || derived.invalidCrossIds)) {
      callouts.push({
        type: "reminder",
        icon: "🧩",
        text: "Cross-subscription requires both subscription IDs in GUID format. Enter both IDs to finalize scope-specific guidance."
      });
    }

    callouts.push({
      type: "rule",
      icon: "🔐",
      html: `To create role assignments at this scope you need ${termChip("Microsoft.Authorization/roleAssignments/write")}. Common roles that grant this include ${termChip("Owner")}, ${termChip("User Access Administrator")}, or ${termChip("Role Based Access Control Administrator")}.`
    });

    if (derived.principal.isManagedIdentity) {
      callouts.push({
        type: "reminder",
        icon: "🤝",
        html: `For managed identities, configure the workload to use this identity and request a ${termChip("Microsoft Entra token")} at runtime. The target service does not pull the identity on its own.`
      });
    }

    if (derived.service.warning) {
      callouts.push({
        type: "warning",
        icon: "⚠️",
        text: derived.service.warning
      });
    }

    if ((derived.principal.key === "user" || derived.principal.key === "group") && derived.service.portalNote) {
      callouts.push({
        type: "reminder",
        icon: "🗂️",
        html: `If a human tests access in the ${termChip("Azure portal")}, add ${termChip("Reader")} on the ${termChip("storage account")} so the portal can show the resource without granting data access.`
      });
    }

    if (derived.service.serviceNote) {
      callouts.push({
        type: "reminder",
        icon: "🗒️",
        text: derived.service.serviceNote
      });
    }

    if (derived.service.nonRbacNetwork) {
      callouts.push({
        type: "trouble",
        icon: "🌫️",
        html: `If RBAC looks correct but access still fails, check network restrictions such as ${termChip("firewalls")}, ${termChip("private endpoints")}, or ${termChip("public network access")}.`
      });
    }

    return callouts;
  }

  function buildSuggestedLine(derived) {
    if (derived.missingMapping) {
      return "Suggested role: unavailable";
    }
    const roleText = derived.isRoleFamily ? derived.roleSummary : derived.roleName;
    return `Suggested role: ${termChip(roleText)}`;
  }

  function buildSummaryLine(derived) {
    const roleText = derived.missingMapping ? "unavailable" : termChip(derived.isRoleFamily ? derived.roleSummary : derived.roleName);
    const scopeSummary = buildScopeSummary(derived);
    const where = derived.isCross
      ? derived.targetSubValid
        ? `target subscription ${wrapCode(state.targetSubscriptionId.trim())}`
        : "target subscription (add IDs)"
      : "current subscription";
    return `Role: ${roleText} · Scope: ${scopeSummary} · Where: ${where}`;
  }

  function buildSuggestedHint(derived) {
    if (derived.isCross && (derived.missingCrossIds || derived.invalidCrossIds)) {
      return "Complete the subscription IDs to finalize scope wording and code examples.";
    }
    return "";
  }

  function renderGuidance(derived) {
    elements.suggestedRole.innerHTML = `<span class="glyph" aria-hidden="true">🧭</span> ${buildSuggestedLine(derived)}`;
    elements.summaryLine.innerHTML = buildSummaryLine(derived);
    elements.summaryNote.textContent =
      derived.isCross && derived.targetSubValid && !derived.missingCrossIds && !derived.invalidCrossIds
        ? "The role assignment is created in the target subscription at the chosen scope, even if the principal is defined elsewhere."
        : "";
    elements.summaryNote.style.display = elements.summaryNote.textContent ? "block" : "none";
    elements.suggestedHint.textContent = buildSuggestedHint(derived);

    const scenario = buildScenarioRecap(derived);
    const scopeNotes = buildScopeNotes(derived);
    const steps = buildSteps(derived);
    const validation = buildValidationSentence(derived);
    const callouts = buildCallouts(derived);

    const stepsMarkup = derived.missingMapping
      ? ""
      : `
        <ol class="step-list">
          ${steps.map(step => `<li>${step}</li>`).join("")}
        </ol>
      `;

    elements.guidanceBody.classList.add("is-refreshing");
    requestAnimationFrame(() => {
      elements.guidanceRecap.innerHTML = scenario;
      elements.guidanceScope.innerHTML = scopeNotes;
      elements.guidanceSteps.innerHTML = stepsMarkup;
      elements.guidanceValidation.innerHTML = derived.missingMapping ? "" : `<p>${escapeHtml(validation)}</p>`;
      updateExamples(derived);
      elements.guidanceCallouts.innerHTML = callouts
        .map(
          callout => `
            <div class="callout ${callout.type}">
              <span class="glyph" aria-hidden="true">${callout.icon}</span>
              <span>${callout.html ? callout.html : escapeHtml(callout.text)}</span>
            </div>
          `
        )
        .join("");
      elements.guidanceBody.classList.remove("is-refreshing");
    });

    logDebug("guidance", { scenario, steps, validation, callouts });
  }

  function initializeGuidanceShell() {
    elements.guidanceBody.innerHTML = `
      <div class="recap" id="guidanceRecap"></div>
      <div class="scope-note" id="guidanceScope"></div>
      <div id="guidanceSteps"></div>
      <div id="guidanceValidation"></div>
      <section class="examples" id="guidanceExamples">
        <h3>Examples</h3>
        <div class="callouts" id="exampleWarnings"></div>
        <div class="example-block">
          <p class="example-preface" id="psPreface"></p>
          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title">PowerShell (Az)</span>
              <button class="copy-btn" type="button" data-copy-target="code-powershell">Copy</button>
            </div>
            <pre class="code-block" id="code-powershell"><code></code></pre>
          </div>
        </div>
        <div class="example-block">
          <p class="example-preface" id="bicepCrossWarning"></p>
          <p class="example-preface" id="bicepPreface"></p>
          <div class="code-panel">
            <div class="code-panel-header">
              <span class="code-panel-title">Bicep</span>
              <button class="copy-btn" type="button" data-copy-target="code-bicep">Copy</button>
            </div>
            <pre class="code-block" id="code-bicep"><code></code></pre>
          </div>
        </div>
      </section>
      <div class="callouts" id="guidanceCallouts"></div>
    `;

    elements.guidanceRecap = document.getElementById("guidanceRecap");
    elements.guidanceScope = document.getElementById("guidanceScope");
    elements.guidanceSteps = document.getElementById("guidanceSteps");
    elements.guidanceValidation = document.getElementById("guidanceValidation");
    elements.guidanceCallouts = document.getElementById("guidanceCallouts");
    elements.exampleWarnings = document.getElementById("exampleWarnings");
    elements.psPreface = document.getElementById("psPreface");
    elements.bicepCrossWarning = document.getElementById("bicepCrossWarning");
    elements.bicepPreface = document.getElementById("bicepPreface");
    elements.codePowerShell = document.getElementById("code-powershell");
    elements.codeBicep = document.getElementById("code-bicep");
  }

  function getSubscriptionIdForCode(derived) {
    if (derived.isCross) {
      return derived.targetSubValid ? state.targetSubscriptionId.trim() : "<target-subscription-guid>";
    }
    return state.mySubscriptionId.trim() || "<current-subscription-guid>";
  }

  function buildScopeResourceId(derived) {
    const override = state.scopeResourceId.trim();
    if (override && looksLikeResourceId(override)) {
      return { value: override, isComplete: true, source: "override" };
    }

    if (derived.isCross && (derived.missingCrossIds || derived.invalidCrossIds || !derived.targetSubValid)) {
      return { value: "<scope-resource-id>", isComplete: false, source: "missing-subscription" };
    }

    const subscriptionId = getSubscriptionIdForCode(derived);
    const rg = state.resourceGroupName.trim();
    const storageAccount = state.storageAccountName.trim();
    const container = state.containerName.trim();
    const fileShare = state.fileShareName.trim();
    const vault = state.vaultName.trim();
    const sbNamespace = state.serviceBusNamespace.trim();
    const sbQueue = state.serviceBusQueue.trim();
    const sbTopic = state.serviceBusTopic.trim();
    const sbSubscription = state.serviceBusSubscription.trim();
    const ehNamespace = state.eventHubsNamespace.trim();
    const ehHub = state.eventHubName.trim();
    const ehConsumer = state.eventHubConsumerGroup.trim();

    switch (state.service) {
      case "storage.blob":
        if (derived.scope.key === "container") {
          if (!rg || !storageAccount || !container) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.Storage/storageAccounts/${storageAccount}/blobServices/default/containers/${container}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "account") {
          if (!rg || !storageAccount) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.Storage/storageAccounts/${storageAccount}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "resourceGroup") {
          if (!rg) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}`,
            isComplete: true,
            source: "generated"
          };
        }
        return { value: "<scope-resource-id>", isComplete: false, source: "unsupported" };
      case "storage.files":
        if (derived.scope.key === "share") {
          if (!rg || !storageAccount || !fileShare) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.Storage/storageAccounts/${storageAccount}/fileServices/default/shares/${fileShare}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "account") {
          if (!rg || !storageAccount) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.Storage/storageAccounts/${storageAccount}`,
            isComplete: true,
            source: "generated"
          };
        }
        return { value: "<scope-resource-id>", isComplete: false, source: "unsupported" };
      case "keyvault.secrets":
        if (derived.scope.key === "vault") {
          if (!rg || !vault) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.KeyVault/vaults/${vault}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "resourceGroup") {
          if (!rg) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}`,
            isComplete: true,
            source: "generated"
          };
        }
        return { value: "<scope-resource-id>", isComplete: false, source: "unsupported" };
      case "servicebus":
        if (!rg || !sbNamespace) {
          return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
        }
        if (derived.scope.key === "namespace") {
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.ServiceBus/namespaces/${sbNamespace}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "queue") {
          if (!sbQueue) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.ServiceBus/namespaces/${sbNamespace}/queues/${sbQueue}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "topic") {
          if (!sbTopic) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.ServiceBus/namespaces/${sbNamespace}/topics/${sbTopic}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "subscription") {
          if (!sbTopic || !sbSubscription) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.ServiceBus/namespaces/${sbNamespace}/topics/${sbTopic}/subscriptions/${sbSubscription}`,
            isComplete: true,
            source: "generated"
          };
        }
        return { value: "<scope-resource-id>", isComplete: false, source: "unsupported" };
      case "eventhubs":
        if (!rg || !ehNamespace) {
          return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
        }
        if (derived.scope.key === "namespace") {
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.EventHub/namespaces/${ehNamespace}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "eventhub") {
          if (!ehHub) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.EventHub/namespaces/${ehNamespace}/eventhubs/${ehHub}`,
            isComplete: true,
            source: "generated"
          };
        }
        if (derived.scope.key === "consumergroup") {
          if (!ehHub || !ehConsumer) {
            return { value: "<scope-resource-id>", isComplete: false, source: "missing-fields" };
          }
          return {
            value: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/Microsoft.EventHub/namespaces/${ehNamespace}/eventhubs/${ehHub}/consumergroups/${ehConsumer}`,
            isComplete: true,
            source: "generated"
          };
        }
        return { value: "<scope-resource-id>", isComplete: false, source: "unsupported" };
      default:
        return { value: "<scope-resource-id>", isComplete: false, source: "unsupported" };
    }
  }

  function buildPowerShellExample(derived) {
    const warnings = [];
    const scopeInfo = buildScopeResourceId(derived);
    const subscriptionId = getSubscriptionIdForCode(derived);
    const principalId = state.principalId.trim() || "<principal-id-guid>";
    const roleDefinitionId = derived.roleDefinitionId || "<role-definition-guid>";

    logDebug("powershell", {
      scopeSource: scopeInfo.source,
      scopeComplete: scopeInfo.isComplete,
      subscriptionId,
      roleDefinitionId
    });

    if (!scopeInfo.isComplete) {
      warnings.push("To generate a runnable script for this scope, paste the full Scope resource ID.");
    }
    if (!derived.roleDefinitionId) {
      warnings.push("This role does not have a role definition GUID in the catalog yet. Replace the placeholder with the correct GUID.");
    }
    if (!state.principalId.trim()) {
      warnings.push("Paste the principalId to make the PowerShell example runnable.");
    }

    const code = [
      "# Creates an Azure RBAC role assignment at the chosen scope.",
      "",
      "# Step 1: Sign in to Azure (interactive browser login by default).",
      "Connect-AzAccount",
      "",
      "# Step 2: Select the subscription that contains the target resource.",
      `$TargetSubscriptionId = "${subscriptionId}"`,
      "Set-AzContext -SubscriptionId $TargetSubscriptionId",
      "",
      "# Step 3: Fill in the three values that define the role assignment.",
      `$PrincipalObjectId = "${principalId}"          # Microsoft Entra objectId (principalId)`,
      `$RoleDefinitionId  = "${roleDefinitionId}"       # Built-in role definition GUID`,
      `$Scope             = "${scopeInfo.value}"          # Full Azure resource ID for the scope`,
      "",
      "# Step 4: Create the role assignment.",
      "New-AzRoleAssignment `",
      "  -ObjectId $PrincipalObjectId `",
      "  -RoleDefinitionId $RoleDefinitionId `",
      "  -Scope $Scope",
      "",
      "# Step 5: Verify the assignment exists.",
      "Get-AzRoleAssignment -ObjectId $PrincipalObjectId -Scope $Scope"
    ].join("\n");

    return { code, warnings };
  }

  function buildBicepExample(derived) {
    const warnings = [];
    const principalType = getPrincipalTypeForBicep(state.principal);
    const roleDefinitionGuid = derived.roleDefinitionId || "<role-definition-guid>";
    const principalIdExpression = state.principalIdExpression.trim() || "<principalId-expression>";
    const useExpression = state.principalIdSource === "bicep";
    const overrideValid = looksLikeResourceId(state.scopeResourceId);
    const principalParamLine = state.principalId.trim()
      ? `param principalId string = '${state.principalId.trim()}'`
      : "param principalId string";
    const principalDecl = useExpression
      ? `var principalIdValue = ${principalIdExpression}`
      : "@description('Microsoft Entra principalId (objectId) of the user, group, service principal, or managed identity.')\n" + principalParamLine;
    const principalRef = useExpression ? "principalIdValue" : "principalId";

    if (!derived.roleDefinitionId) {
      warnings.push("This role does not have a role definition GUID in the catalog yet. Replace the placeholder with the correct GUID.");
    }
    if (useExpression && !state.principalIdExpression.trim()) {
      warnings.push("Provide a Bicep principalId expression to use the advanced principalId source.");
    }

    const template = buildBicepTemplateForService(
      derived,
      principalDecl,
      principalRef,
      principalType,
      roleDefinitionGuid,
      overrideValid
    );
    if (template.isFallback && !overrideValid) {
      warnings.push("To generate a runnable Bicep example for this scope, paste the full Scope resource ID.");
    }

    logDebug("bicep", {
      scopeTemplate: template.isFallback ? "fallback" : "service",
      principalType,
      roleDefinitionGuid
    });

    return { code: template.code, warnings, isFallback: template.isFallback };
  }

  function buildBicepFallbackTemplate(principalDecl, principalRef, principalType, scopeOverrideValue, roleDefinitionGuid) {
    const scopeParamLine = scopeOverrideValue
      ? `param scopeResourceId string = '${scopeOverrideValue}'`
      : "param scopeResourceId string";
    const roleParamLine = roleDefinitionGuid
      ? `param roleDefinitionGuid string = '${roleDefinitionGuid}'`
      : "param roleDefinitionGuid string";
    return {
      code: [
        "targetScope = 'resourceGroup'",
        "",
        principalDecl,
        "",
        "@description('Built-in role definition GUID for the selected role.')",
        roleParamLine,
        "@description('Full Azure resource ID for the scope (advanced).')",
        scopeParamLine,
        "",
        "resource ra 'Microsoft.Authorization/roleAssignments@2022-04-01' = {",
        "  name: guid(scopeResourceId, " + principalRef + ", roleDefinitionGuid)",
        "  scope: scopeResourceId",
        "  properties: {",
        "    principalId: " + principalRef,
        "    principalType: '" + principalType + "'",
        "    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleDefinitionGuid)",
        "  }",
        "}"
      ].join("\n"),
      isFallback: true
    };
  }

  function buildBicepTemplateForService(derived, principalDecl, principalRef, principalType, roleDefinitionGuid, useScopeOverride) {
    if (useScopeOverride) {
      return buildBicepFallbackTemplate(principalDecl, principalRef, principalType, state.scopeResourceId.trim(), roleDefinitionGuid);
    }
    const roleParamLine = `param roleDefinitionGuid string = '${roleDefinitionGuid}'`;
    const lines = ["targetScope = 'resourceGroup'", "", principalDecl, "", "@description('Built-in role definition GUID for the selected role.')", roleParamLine];
    const resources = [];
    let scopeExpression = "";
    let scopeIdExpression = "";

    const addParams = params => {
      params.forEach(paramLine => lines.push(paramLine));
    };

    switch (state.service) {
      case "storage.blob":
        if (derived.scope.key === "resourceGroup") {
          scopeExpression = "resourceGroup()";
          scopeIdExpression = "resourceGroup().id";
          break;
        }
        addParams([
          "@description('Existing storage account name.')",
          "param storageAccountName string"
        ]);
        resources.push(
          "resource stg 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {",
          "  name: storageAccountName",
          "}"
        );
        if (derived.scope.key === "container") {
          addParams([
            "@description('Container name when assigning at container scope.')",
            "param containerName string"
          ]);
          resources.push(
            "resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' existing = {",
            "  name: '${storageAccountName}/default/${containerName}'",
            "}"
          );
          scopeExpression = "container";
          scopeIdExpression = "container.id";
        } else {
          scopeExpression = "stg";
          scopeIdExpression = "stg.id";
        }
        break;
      case "storage.files":
        addParams([
          "@description('Existing storage account name.')",
          "param storageAccountName string"
        ]);
        resources.push(
          "resource stg 'Microsoft.Storage/storageAccounts@2022-09-01' existing = {",
          "  name: storageAccountName",
          "}"
        );
        if (derived.scope.key === "share") {
          addParams([
            "@description('File share name when assigning at share scope.')",
            "param fileShareName string"
          ]);
          resources.push(
            "resource share 'Microsoft.Storage/storageAccounts/fileServices/shares@2022-09-01' existing = {",
            "  name: '${storageAccountName}/default/${fileShareName}'",
            "}"
          );
          scopeExpression = "share";
          scopeIdExpression = "share.id";
        } else {
          scopeExpression = "stg";
          scopeIdExpression = "stg.id";
        }
        break;
      case "keyvault.secrets":
        if (derived.scope.key === "resourceGroup") {
          scopeExpression = "resourceGroup()";
          scopeIdExpression = "resourceGroup().id";
          break;
        }
        addParams([
          "@description('Existing Key Vault name.')",
          "param vaultName string"
        ]);
        resources.push(
          "resource kv 'Microsoft.KeyVault/vaults@2022-07-01' existing = {",
          "  name: vaultName",
          "}"
        );
        scopeExpression = "kv";
        scopeIdExpression = "kv.id";
        break;
      case "servicebus":
        addParams([
          "@description('Existing Service Bus namespace name.')",
          "param serviceBusNamespace string"
        ]);
        resources.push(
          "resource sbNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' existing = {",
          "  name: serviceBusNamespace",
          "}"
        );
        if (derived.scope.key === "queue") {
          addParams([
            "@description('Queue name when assigning at queue scope.')",
            "param serviceBusQueueName string"
          ]);
          resources.push(
            "resource sbQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' existing = {",
            "  name: '${serviceBusNamespace}/${serviceBusQueueName}'",
            "}"
          );
          scopeExpression = "sbQueue";
          scopeIdExpression = "sbQueue.id";
        } else if (derived.scope.key === "topic") {
          addParams([
            "@description('Topic name when assigning at topic scope.')",
            "param serviceBusTopicName string"
          ]);
          resources.push(
            "resource sbTopic 'Microsoft.ServiceBus/namespaces/topics@2022-10-01-preview' existing = {",
            "  name: '${serviceBusNamespace}/${serviceBusTopicName}'",
            "}"
          );
          scopeExpression = "sbTopic";
          scopeIdExpression = "sbTopic.id";
        } else if (derived.scope.key === "subscription") {
          addParams([
            "@description('Topic name when assigning at subscription scope.')",
            "param serviceBusTopicName string",
            "@description('Subscription name when assigning at subscription scope.')",
            "param serviceBusSubscriptionName string"
          ]);
          resources.push(
            "resource sbSubscription 'Microsoft.ServiceBus/namespaces/topics/subscriptions@2022-10-01-preview' existing = {",
            "  name: '${serviceBusNamespace}/${serviceBusTopicName}/${serviceBusSubscriptionName}'",
            "}"
          );
          scopeExpression = "sbSubscription";
          scopeIdExpression = "sbSubscription.id";
        } else {
          scopeExpression = "sbNamespace";
          scopeIdExpression = "sbNamespace.id";
        }
        break;
      case "eventhubs":
        addParams([
          "@description('Existing Event Hubs namespace name.')",
          "param eventHubsNamespace string"
        ]);
        resources.push(
          "resource ehNamespace 'Microsoft.EventHub/namespaces@2022-10-01-preview' existing = {",
          "  name: eventHubsNamespace",
          "}"
        );
        if (derived.scope.key === "eventhub") {
          addParams([
            "@description('Event hub name when assigning at event hub scope.')",
            "param eventHubName string"
          ]);
          resources.push(
            "resource ehHub 'Microsoft.EventHub/namespaces/eventhubs@2022-10-01-preview' existing = {",
            "  name: '${eventHubsNamespace}/${eventHubName}'",
            "}"
          );
          scopeExpression = "ehHub";
          scopeIdExpression = "ehHub.id";
        } else if (derived.scope.key === "consumergroup") {
          addParams([
            "@description('Event hub name when assigning at consumer group scope.')",
            "param eventHubName string",
            "@description('Consumer group name when assigning at consumer group scope.')",
            "param consumerGroupName string"
          ]);
          resources.push(
            "resource ehConsumer 'Microsoft.EventHub/namespaces/eventhubs/consumergroups@2022-10-01-preview' existing = {",
            "  name: '${eventHubsNamespace}/${eventHubName}/${consumerGroupName}'",
            "}"
          );
          scopeExpression = "ehConsumer";
          scopeIdExpression = "ehConsumer.id";
        } else {
          scopeExpression = "ehNamespace";
          scopeIdExpression = "ehNamespace.id";
        }
        break;
      default:
        return buildBicepFallbackTemplate(principalDecl, principalRef, principalType, state.scopeResourceId.trim(), roleDefinitionGuid);
    }

    lines.push("");
    if (resources.length) {
      lines.push(...resources, "");
    }

    lines.push(
      "resource ra 'Microsoft.Authorization/roleAssignments@2022-04-01' = {",
      `  name: guid(${scopeIdExpression}, ${principalRef}, roleDefinitionGuid)`,
      `  scope: ${scopeExpression}`,
      "  properties: {",
      `    principalId: ${principalRef}`,
      `    principalType: '${principalType}'`,
      "    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleDefinitionGuid)",
      "  }",
      "}"
    );

    return { code: lines.join("\n"), isFallback: false };
  }

  function updateExamples(derived) {
    const ps = buildPowerShellExample(derived);
    const bicep = buildBicepExample(derived);
    const warnings = [...ps.warnings, ...bicep.warnings].filter((item, index, arr) => arr.indexOf(item) === index);

    logDebug("examples", {
      roleDefinitionId: derived.roleDefinitionId,
      principalIdSource: state.principalIdSource,
      warningsCount: warnings.length
    });

    if (elements.exampleWarnings) {
      elements.exampleWarnings.innerHTML = warnings
        .map(
          warning => `
            <div class="callout reminder">
              <span class="glyph" aria-hidden="true">ℹ️</span>
              <span>${escapeHtml(warning)}</span>
            </div>
          `
        )
        .join("");
      elements.exampleWarnings.style.display = warnings.length ? "grid" : "none";
    }

    if (elements.psPreface) {
      elements.psPreface.textContent =
        "This PowerShell snippet signs in, selects the target subscription, and creates the role assignment at the chosen scope.";
    }

    const bicepPreface = bicep.isFallback
      ? "This Bicep snippet uses an explicit scope resource ID to place the role assignment. Replace the scope placeholder with a deployable target scope."
      : "This Bicep snippet declares the target scope and creates a role assignment resource for the selected principal.";

    if (elements.bicepCrossWarning) {
      elements.bicepCrossWarning.textContent = derived.isCross
        ? "Cross-subscription role assignments require deploying the role assignment at the target scope. Use a separate deployment targeting the target subscription, or a module deployed at that scope."
        : "";
      elements.bicepCrossWarning.style.display = derived.isCross ? "block" : "none";
    }

    if (elements.bicepPreface) {
      elements.bicepPreface.textContent = bicepPreface;
    }

    if (elements.codePowerShell) {
      const codeEl = elements.codePowerShell.querySelector("code");
      if (codeEl) codeEl.textContent = ps.code;
    }
    if (elements.codeBicep) {
      const codeEl = elements.codeBicep.querySelector("code");
      if (codeEl) codeEl.textContent = bicep.code;
    }
  }

  function initializeOptions() {
    buildOptions(elements.principal, PRINCIPALS, state.principal);
    buildOptions(elements.workload, WORKLOADS, state.workload);
    buildOptions(elements.accessMethod, ACCESS_METHODS, state.accessMethod);
    buildOptions(elements.intent, INTENTS, state.intent);
    buildOptions(elements.service, SERVICE_OPTIONS, state.service);
    buildOptions(
      elements.subscriptionRelation,
      SUBSCRIPTIONS,
      state.subscriptionRelation
    );
    buildOptions(elements.principalIdSource, PRINCIPAL_ID_SOURCES, state.principalIdSource);
    updateScopeOptions();
  }

  function updateScopeOptions() {
    const service = getService(state.service);
    const selectedScope = state.scope && service.scopes.some(scope => scope.key === state.scope)
      ? state.scope
      : service.defaultScope;
    state.scope = selectedScope;
    buildOptions(elements.scope, service.scopes, selectedScope);
    if (elements.scopeWrapper) {
      elements.scopeWrapper.dataset.default = service.defaultScope;
    }
  }

  function renderDiagram(derived) {
    const container = elements.diagramCanvas;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    const placeholder = derived.isCross && (derived.missingCrossIds || derived.invalidCrossIds);
    if (placeholder) {
      container.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diagram-svg-title diagram-svg-desc">
          <title id="diagram-svg-title">Scenario diagram</title>
          <desc id="diagram-svg-desc">Diagram placeholder until subscription IDs are complete.</desc>
          <rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="18" ry="18" fill="none" stroke="rgba(43,42,40,0.12)" stroke-width="1" />
          <text x="${width / 2}" y="${height / 2}" text-anchor="middle" class="svg-label">Complete subscription IDs to render the boundary diagram.</text>
        </svg>
      `;
      elements.diagramAlt.textContent = "Diagram placeholder: complete subscription IDs to render the boundary diagram.";
      logDebug("diagram", { placeholder: true, width, height });
      return;
    }

    const layoutMode = width < 720 ? "vertical" : "horizontal";
    const seed = hashSeed(`${state.principal}|${state.workload}|${state.intent}|${state.service}|${state.scope}|${state.subscriptionRelation}`);
    const rng = mulberry32(seed);

    const padding = 26;
    const legendHeight = 44;
    const usableHeight = Math.min(Math.max(60, height - legendHeight - padding), height - padding);

    const nodeSizes = {
      principal: { w: 180, h: 46, r: 23 },
      runtime: { w: 190, h: 58, r: 16 },
      target: { w: 210, h: 62, r: 16 }
    };

    const layout = computeLayout(layoutMode, width, usableHeight, padding, nodeSizes, derived.isCross);

    const svgParts = [];

    svgParts.push(`<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="diagram-svg-title diagram-svg-desc">`);
    svgParts.push(`<title id="diagram-svg-title">Scenario diagram</title>`);
    svgParts.push(`<desc id="diagram-svg-desc">${escapeHtml(buildDiagramAlt(derived))}</desc>`);
    svgParts.push(`
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8" fill="none" stroke="rgba(43,42,40,0.6)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        </marker>
      </defs>
    `);

    if (derived.isCross) {
      svgParts.push(renderContainer(layout.containers.left, "My subscription", derived.mySubValid ? state.mySubscriptionId.trim() : "", rng));
      svgParts.push(renderContainer(layout.containers.right, "Target subscription", derived.targetSubValid ? state.targetSubscriptionId.trim() : "", rng));
    } else {
      svgParts.push(renderContainer(layout.containers.single, "Subscription", "", rng));
    }

    svgParts.push(renderNode(layout.nodes.principal, getPrincipalLabel(state.principal), "Principal", rng, true));
    svgParts.push(renderNode(layout.nodes.runtime, getWorkloadLabel(state.workload), "Workload", rng, false));
    svgParts.push(renderNode(layout.nodes.target, SERVICES[state.service].label, "Target", rng, false, true));

    svgParts.push(renderEdge(layout.edges.principalToRuntime, rng, true));
    svgParts.push(renderEdge(layout.edges.runtimeToTarget, rng, true));

    svgParts.push(renderEdgeLabel(layout.edgeLabel, derived, rng));
    svgParts.push(renderLegend(width, height, padding));

    svgParts.push("</svg>");

    container.innerHTML = svgParts.join("");

    elements.diagramAlt.textContent = buildDiagramAlt(derived);
    logDebug("diagram", { layoutMode, width, height, nodes: layout.nodes, edges: layout.edges });
  }

  function buildDiagramAlt(derived) {
    const scopeLabel = derived.scope.scopeSummary;
    const roleText = derived.missingMapping
      ? "a missing role mapping"
      : derived.isRoleFamily
        ? derived.roleSummary
        : derived.roleName;
    const relationText = derived.isCross ? "across subscriptions" : "within one subscription";
    return `${getPrincipalLabel(state.principal)} uses ${getWorkloadLabel(state.workload)} to access ${derived.service.label} ${relationText} with ${roleText} at ${scopeLabel} scope.`;
  }

  function computeLayout(mode, width, height, padding, sizes, isCross) {
    const centerY = padding + height / 2;
    const edgePad = 10;
    if (mode === "vertical") {
      const available = height - padding * 2;
      const baseSpacing = (available - (sizes.principal.h + sizes.runtime.h + sizes.target.h)) / 2;
      const spacing = Math.max(18, Math.min(32, baseSpacing));
      const totalHeight = sizes.principal.h + sizes.runtime.h + sizes.target.h + spacing * 2;
      const startY = padding + Math.max(0, (height - totalHeight) / 2);

      const principal = {
        x: width / 2 - sizes.principal.w / 2,
        y: startY,
        ...sizes.principal
      };
      const runtime = {
        x: width / 2 - sizes.runtime.w / 2,
        y: principal.y + sizes.principal.h + spacing,
        ...sizes.runtime
      };
      const target = {
        x: width / 2 - sizes.target.w / 2,
        y: runtime.y + sizes.runtime.h + spacing,
        ...sizes.target
      };

      const containers = isCross
        ? {
            left: {
              x: padding,
              y: principal.y - 18,
              w: width - padding * 2,
              h: runtime.y + runtime.h - principal.y + 36
            },
            right: {
              x: padding,
              y: target.y - 18,
              w: width - padding * 2,
              h: target.h + 36
            }
          }
        : {
            single: {
              x: padding,
              y: principal.y - 18,
              w: width - padding * 2,
              h: target.y + target.h - principal.y + 36
            }
          };

      return {
        nodes: { principal, runtime, target },
        containers,
        edges: {
          principalToRuntime: {
            x1: principal.x + principal.w / 2,
            y1: principal.y + principal.h + edgePad,
            x2: runtime.x + runtime.w / 2,
            y2: runtime.y - edgePad
          },
          runtimeToTarget: {
            x1: runtime.x + runtime.w / 2,
            y1: runtime.y + runtime.h + edgePad,
            x2: target.x + target.w / 2,
            y2: target.y - edgePad
          }
        },
        edgeLabel: {
          x: Math.min(width - padding - 140, width / 2 + 80),
          y: runtime.y + runtime.h + 18,
          align: "start",
          mode: "vertical"
        }
      };
    }

    const gap = 26;
    const boundary = width / 2;
    const left = padding + 12;
    const right = width - padding - 12;
    const containerHeight = Math.max(140, Math.min(240, height - padding * 2));

    const containers = isCross
      ? {
          left: {
            x: padding,
            y: centerY - containerHeight / 2,
            w: boundary - padding - gap,
            h: containerHeight
          },
          right: {
            x: boundary + gap,
            y: centerY - containerHeight / 2,
            w: width - padding - (boundary + gap),
            h: containerHeight
          }
        }
      : {
          single: {
            x: padding,
            y: centerY - containerHeight / 2,
            w: width - padding * 2,
            h: containerHeight
          }
        };

    const principal = {
      x: left,
      y: centerY - sizes.principal.h / 2,
      ...sizes.principal
    };

    const runtime = {
      x: isCross
        ? containers.left.x + containers.left.w - sizes.runtime.w - 18
        : width / 2 - sizes.runtime.w / 2,
      y: centerY - sizes.runtime.h / 2,
      ...sizes.runtime
    };

    const target = {
      x: right - sizes.target.w,
      y: centerY - sizes.target.h / 2,
      ...sizes.target
    };

    return {
      nodes: { principal, runtime, target },
      containers,
      edges: {
        principalToRuntime: {
          x1: principal.x + principal.w + edgePad,
          y1: principal.y + principal.h / 2,
          x2: runtime.x - edgePad,
          y2: runtime.y + runtime.h / 2
        },
        runtimeToTarget: {
          x1: runtime.x + runtime.w + edgePad,
          y1: runtime.y + runtime.h / 2,
          x2: target.x - edgePad,
          y2: target.y + target.h / 2
        }
      },
      edgeLabel: {
        x: Math.min(target.x - 80, runtime.x + runtime.w + 40),
        y: runtime.y - 22,
        align: "middle",
        mode: "horizontal"
      }
    };
  }

  function renderContainer(box, label, idText, rng) {
    const path = wobblyRoundedRect(box.x, box.y, box.w, box.h, 20, rng, 1.6);
    const titleX = box.x + 16;
    const titleY = box.y + 22;
    const idLine = idText ? `<tspan x="${titleX}" dy="14">${escapeHtml(idText)}</tspan>` : "";
    return `
      <path d="${path}" fill="rgba(47,111,98,0.04)" stroke="rgba(43,42,40,0.16)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      <text x="${titleX}" y="${titleY}" class="svg-sub">${escapeHtml(label)}${idLine}</text>
    `;
  }

  function renderNode(node, label, subLabel, rng, isPill = false, isTarget = false) {
    const radius = isPill ? node.h / 2 : node.r;
    const path = wobblyRoundedRect(node.x, node.y, node.w, node.h, radius, rng, 2);
    const stroke = isTarget ? "rgba(122,75,107,0.5)" : "rgba(43,42,40,0.25)";
    const fill = isTarget ? "rgba(122,75,107,0.08)" : "rgba(255,255,255,0.85)";
    const labelX = node.x + node.w / 2;
    const labelY = node.y + node.h / 2 - 2;
    const subY = node.y + node.h / 2 + 14;
    return `
      <path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      <text x="${labelX}" y="${labelY}" text-anchor="middle" class="svg-label">${escapeHtml(label)}</text>
      <text x="${labelX}" y="${subY}" text-anchor="middle" class="svg-sub">${escapeHtml(subLabel)}</text>
    `;
  }

  function renderEdge(edge, rng, withArrow = false) {
    const midX = (edge.x1 + edge.x2) / 2 + jitter(rng, 12);
    const midY = (edge.y1 + edge.y2) / 2 + jitter(rng, 8);
    const path = `M ${edge.x1} ${edge.y1} Q ${midX} ${midY} ${edge.x2} ${edge.y2}`;
    const marker = withArrow ? "url(#arrow)" : "";
    return `
      <path d="${path}" fill="none" stroke="rgba(43,42,40,0.45)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" marker-end="${marker}" />
    `;
  }

  function renderEdgeLabel(labelPos, derived, rng) {
    const roleText = derived.missingMapping
      ? "Role mapping missing"
      : derived.isRoleFamily
        ? derived.roleSummary
        : derived.roleName;
    const scopeText = `Scope: ${derived.scope.scopeSummary}`;
    const badgeText = intentBadge(derived.intent.key);

    const badgeWidth = 70;
    const badgeHeight = 22;
    const badgeX = labelPos.align === "middle" ? labelPos.x - badgeWidth / 2 : labelPos.x;
    const badgeY = labelPos.y + (labelPos.mode === "vertical" ? 30 : 28);
    const badgePath = wobblyRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 10, rng, 1);

    return `
      <text x="${labelPos.x}" y="${labelPos.y}" text-anchor="${labelPos.align}" class="svg-label">
        <tspan x="${labelPos.x}" dy="0">${escapeHtml(roleText)}</tspan>
        <tspan x="${labelPos.x}" dy="16">${escapeHtml(scopeText)}</tspan>
      </text>
      <path d="${badgePath}" fill="rgba(47,111,98,0.08)" stroke="rgba(43,42,40,0.2)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
      <text x="${badgeX + badgeWidth / 2}" y="${badgeY + 15}" text-anchor="middle" class="svg-badge">${escapeHtml(badgeText)}</text>
    `;
  }

  function renderLegend(width, height, padding) {
    const x = padding + 6;
    const y = height - padding - 6;
    return `
      <text x="${x}" y="${y}" class="svg-legend">Legend: label = role + scope. Badge = intent. Arrows show token requests.</text>
    `;
  }

  function intentBadge(intentKey) {
    switch (intentKey) {
      case "read":
        return "read";
      case "write":
        return "write";
      case "admin":
        return "admin";
      case "manage":
        return "manage";
      default:
        return "";
    }
  }

  function getPrincipalLabel(key) {
    const principal = PRINCIPALS.find(item => item.key === key);
    return principal ? principal.label.replace(/^a /, "").replace(/^an /, "") : key;
  }

  function jitter(rng, amount) {
    return (rng() - 0.5) * amount;
  }

  function wobblyRoundedRect(x, y, w, h, r, rng, amount) {
    const points = [
      { x: x + r, y },
      { x: x + w - r, y },
      { x: x + w, y: y + r },
      { x: x + w, y: y + h - r },
      { x: x + w - r, y: y + h },
      { x: x + r, y: y + h },
      { x, y: y + h - r },
      { x, y: y + r },
      { x: x + r, y }
    ].map(point => ({
      x: point.x + jitter(rng, amount),
      y: point.y + jitter(rng, amount)
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2 + jitter(rng, amount);
      const midY = (prev.y + curr.y) / 2 + jitter(rng, amount);
      path += ` Q ${midX} ${midY} ${curr.x} ${curr.y}`;
    }
    return path + " Z";
  }

  function mulberry32(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), t | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashSeed(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function render() {
    updateCrossFields(state.subscriptionRelation === "cross");
    updateScopeOptions();

    const derived = derive();
    updateInvalidStates(derived);
    updateNarrativeVisibility(derived);
    updatePrincipalIdSource();
    updateIdentifierFields(derived);
    markCompletion();
    renderGuidance(derived);
    renderDiagram(derived);
    autoSizeInlineSelects();
  }

  function attachListeners() {
    elements.principal.addEventListener("change", event => {
      const principalKey = event.target.value;
      const patch = { principal: principalKey };
      if (principalKey === "managedIdentityUserAssigned") {
        patch.workload = "functions";
      }
      if (principalKey === "user") {
        patch.accessMethod = "portal";
      }
      setState(patch);
    });
    elements.workload.addEventListener("change", event => setState({ workload: event.target.value }));
    elements.accessMethod.addEventListener("change", event => setState({ accessMethod: event.target.value }));
    elements.intent.addEventListener("change", event => setState({ intent: event.target.value }));
    elements.service.addEventListener("change", event => setState({ service: event.target.value }));
    elements.subscriptionRelation.addEventListener("change", event => setState({ subscriptionRelation: event.target.value }));
    elements.scope.addEventListener("change", event => setState({ scope: event.target.value }));
    elements.targetName.addEventListener("input", event => setState({ targetName: event.target.value }));
    elements.mySubscriptionId.addEventListener("input", event => setState({ mySubscriptionId: event.target.value }));
    elements.targetSubscriptionId.addEventListener("input", event => setState({ targetSubscriptionId: event.target.value }));
    elements.principalIdSource.addEventListener("change", event => setState({ principalIdSource: event.target.value }));
    elements.principalId.addEventListener("input", event => setState({ principalId: event.target.value }));
    elements.principalIdExpression.addEventListener("input", event => setState({ principalIdExpression: event.target.value }));
    elements.resourceGroupName.addEventListener("input", event => setState({ resourceGroupName: event.target.value }));
    elements.scopeResourceId.addEventListener("input", event => setState({ scopeResourceId: event.target.value }));
    elements.storageAccountName.addEventListener("input", event => setState({ storageAccountName: event.target.value }));
    elements.containerName.addEventListener("input", event => setState({ containerName: event.target.value }));
    elements.fileShareName.addEventListener("input", event => setState({ fileShareName: event.target.value }));
    elements.vaultName.addEventListener("input", event => setState({ vaultName: event.target.value }));
    elements.serviceBusNamespace.addEventListener("input", event => setState({ serviceBusNamespace: event.target.value }));
    elements.serviceBusQueue.addEventListener("input", event => setState({ serviceBusQueue: event.target.value }));
    elements.serviceBusTopic.addEventListener("input", event => setState({ serviceBusTopic: event.target.value }));
    elements.serviceBusSubscription.addEventListener("input", event => setState({ serviceBusSubscription: event.target.value }));
    elements.eventHubsNamespace.addEventListener("input", event => setState({ eventHubsNamespace: event.target.value }));
    elements.eventHubName.addEventListener("input", event => setState({ eventHubName: event.target.value }));
    elements.eventHubConsumerGroup.addEventListener("input", event => setState({ eventHubConsumerGroup: event.target.value }));
  }

  function restoreDiagramHeight() {
    const saved = safeStorageGet("calmrbac.diagramHeight");
    if (!saved) return;
    const height = Number(saved);
    if (!Number.isNaN(height) && height > 200) {
      elements.diagramResize.style.height = `${height}px`;
    }
  }

  function observeDiagramResize() {
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === elements.diagramResize) {
          const height = entry.contentRect.height;
          safeStorageSet("calmrbac.diagramHeight", String(Math.round(height)));
          render();
        }
      });
    });
    observer.observe(elements.diagramResize);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        document.body.removeChild(textarea);
        resolve();
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  function attachCopyHandler() {
    elements.guidanceBody.addEventListener("click", event => {
      const button = event.target.closest(".copy-btn");
      if (!button) return;
      const targetId = button.dataset.copyTarget;
      const codeBlock = targetId ? document.getElementById(targetId) : null;
      if (!codeBlock) return;
      const text = codeBlock.innerText.replace(/\n$/, "");
      const originalLabel = button.textContent;
      copyToClipboard(text)
        .then(() => {
          button.textContent = "Copied";
          setTimeout(() => {
            button.textContent = originalLabel;
          }, 1400);
        })
        .catch(error => {
          logDebug("copy:failed", { error });
          button.textContent = "Failed";
          setTimeout(() => {
            button.textContent = originalLabel;
          }, 1400);
        });
    });
  }

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logDebug("storage:get:blocked", { key, error });
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logDebug("storage:set:blocked", { key, error });
    }
  }

  function init() {
    initializeOptions();
    initializeGuidanceShell();
    attachListeners();
    attachCopyHandler();
    restoreDiagramHeight();
    observeDiagramResize();
    window.addEventListener("resize", () => render());
    render();
  }

  init();
})();
