2026-01-29
Z00 Appendix: Reference Data Pack for "Azure Role Guide" (project helper dataset)

This appendix is a reference dataset and rulebook intended to prevent role-name mistakes and reduce ambiguity when implementing the role-selection logic and the generated guidance text. It includes (1) canonical role names and roleDefinitionIds for common Azure access patterns, (2) scope rules and scope templates, (3) principal types the UI should support, and (4) service-specific notes that affect what guidance is correct.

Z10 Canonical principal types (for the "I am ..." selector)

Use the following set of principal types and labels. The implementer should treat these as display labels only; the underlying concept is "security principal" (principalId/objectId) in Microsoft Entra ID.

```json
{
  "principalTypes": [
    { "key": "user", "label": "A user (human)", "notes": "Microsoft Entra user object." },
    { "key": "group", "label": "A group", "notes": "Microsoft Entra security group. Prefer group assignments for teams." },
    { "key": "servicePrincipal", "label": "An app registration (service principal)", "notes": "Enterprise application / service principal." },
    { "key": "managedIdentitySystemAssigned", "label": "A system-assigned managed identity", "notes": "Identity lifecycle is tied to an Azure resource." },
    { "key": "managedIdentityUserAssigned", "label": "A user-assigned managed identity", "notes": "Standalone managed identity resource; assignable to multiple resources." }
  ]
}
```

Z20 Scope model and canonical scope templates

A role assignment always binds (principalId, roleDefinitionId, scope). Guidance generation must explicitly state the scope and why that scope is chosen.

```json
{
  "scopeTemplates": {
    "managementGroup": "/providers/Microsoft.Management/managementGroups/{managementGroupId}",
    "subscription": "/subscriptions/{subscriptionId}",
    "resourceGroup": "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}",
    "resource": "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceTypePath}/{resourceName}",
    "childResource": "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/{resourceProviderNamespace}/{resourceTypePath}/{parentName}/{childType}/{childName}"
  },
  "scopeSelectionRules": [
    "Choose the narrowest scope that satisfies the user intent.",
    "If the user intent is data access for a single storage container, choose the container scope when supported; otherwise choose the storage account scope.",
    "If the user selects cross-subscription access, the scope always resides in the target subscription (the subscription that contains the resource being accessed)."
  ]
}
```

Role-definition listing and scope examples are consistent with Azure RBAC documentation. ([Microsoft Learn][1])

Z30 Minimum permissions to create role assignments (for the tool's self-check messaging)

When the tool generates steps that include creating a role assignment, it must be able to warn the user if they might not have permission. The rule is: to create role assignments, the actor must have the `Microsoft.Authorization/roleAssignments/write` permission at the chosen scope (or above). This is commonly granted by roles such as Role Based Access Control Administrator. ([Microsoft Learn][2])

Use this table as the reference for common "can assign roles" roles and their IDs:

| Role name                               | Purpose (short)                                       | roleDefinitionId (GUID)                                     |
| --------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| Owner                                   | Full management, including assigning roles            | 8e3af657-a8ff-443c-a75c-2fe8c4bcb635 ([Microsoft Learn][3]) |
| Role Based Access Control Administrator | Assign Azure RBAC roles (delegated access management) | f58310d9-a9f6-439a-9e8d-f62e7b41a168 ([Microsoft Learn][3]) |
| User Access Administrator               | Manage user access to Azure resources                 | 18d7d88d-d35e-4fb5-a5c3-7773c20a72d9 ([Microsoft Learn][3]) |

Z40 General "read-only ARM visibility" role (often paired with data-plane roles)

Many user scenarios require both (a) data-plane permissions to the target data and (b) at least read-only visibility of the resource in the Azure portal. Use the following canonical Reader role record:

| Role name | Purpose (short)            | roleDefinitionId (GUID)                                     |
| --------- | -------------------------- | ----------------------------------------------------------- |
| Reader    | View resources, no changes | acdd72a7-3385-48ef-bd42-f606fba81ae7 ([Microsoft Learn][3]) |

For Azure Storage blob data access in particular, the ARM Reader role is explicitly described as allowing users to view storage account resources without providing data access; data access is granted by the Storage Blob Data roles. ([Microsoft Learn][4])

Z50 Service catalog: canonical roles, IDs, and scope guidance

The dataset below is intended to be embedded into the app as static reference data (JSON). The implementer should not attempt to infer role names by string construction. Use these exact roleName strings and GUIDs.

```json
{
  "services": [
    {
      "key": "storage.blob",
      "label": "Azure Storage: Blob (containers and blobs)",
      "targetResource": {
        "provider": "Microsoft.Storage",
        "resourceType": "storageAccounts",
        "commonChildScopes": [
          "storageAccounts/blobServices/containers (container scope)"
        ]
      },
      "roles": [
        {
          "roleName": "Storage Blob Data Reader",
          "roleDefinitionId": "2a2b9908-6ea1-4ae2-8e65-a410df84e7d1",
          "intentTags": ["read", "list"]
        },
        {
          "roleName": "Storage Blob Data Contributor",
          "roleDefinitionId": "ba92f5b4-2d11-453d-a403-e96b0029c9fe",
          "intentTags": ["read", "write", "delete"]
        },
        {
          "roleName": "Storage Blob Data Owner",
          "roleDefinitionId": "b7e6dc6d-f1e8-4753-8033-0f276bb0955b",
          "intentTags": ["full", "posixAcl"]
        }
      ],
      "portalVisibilityRoleSuggestion": {
        "roleName": "Reader",
        "roleDefinitionId": "acdd72a7-3385-48ef-bd42-f606fba81ae7",
        "when": "When the user needs to navigate the storage account or container in the Azure portal."
      }
    },
    {
      "key": "storage.queue",
      "label": "Azure Storage: Queue (queues and messages)",
      "targetResource": {
        "provider": "Microsoft.Storage",
        "resourceType": "storageAccounts",
        "commonChildScopes": [
          "storageAccounts/queueServices/queues (queue scope)"
        ]
      },
      "roles": [
        {
          "roleName": "Storage Queue Data Reader",
          "roleDefinitionId": "19e7f393-937e-4f77-808e-94535e297925",
          "intentTags": ["read", "peek", "list"]
        },
        {
          "roleName": "Storage Queue Data Message Sender",
          "roleDefinitionId": "c6a89b2d-59bc-44d0-9896-0f6e12d7b80a",
          "intentTags": ["sendOnly"]
        },
        {
          "roleName": "Storage Queue Data Message Processor",
          "roleDefinitionId": "8a0f0c08-91a1-4084-bc3d-661d67233fed",
          "intentTags": ["process", "receiveAndDelete"]
        },
        {
          "roleName": "Storage Queue Data Contributor",
          "roleDefinitionId": "974c5e8b-45b9-4653-ba55-5f855dd0fb88",
          "intentTags": ["read", "write", "delete", "manageQueues"]
        }
      ]
    },
    {
      "key": "storage.table",
      "label": "Azure Storage: Table (tables and entities)",
      "targetResource": {
        "provider": "Microsoft.Storage",
        "resourceType": "storageAccounts",
        "commonChildScopes": [
          "storageAccounts/tableServices/tables (table scope)"
        ]
      },
      "roles": [
        {
          "roleName": "Storage Table Data Reader",
          "roleDefinitionId": "76199698-9eea-4c19-bc75-cec21354c6b6",
          "intentTags": ["read", "query"]
        },
        {
          "roleName": "Storage Table Data Contributor",
          "roleDefinitionId": "0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3",
          "intentTags": ["read", "write", "delete"]
        }
      ]
    },
    {
      "key": "servicebus",
      "label": "Azure Service Bus (queues, topics, subscriptions)",
      "targetResource": {
        "provider": "Microsoft.ServiceBus",
        "resourceType": "namespaces",
        "commonChildScopes": [
          "namespaces/queues",
          "namespaces/topics",
          "namespaces/topics/subscriptions"
        ]
      },
      "roles": [
        {
          "roleName": "Azure Service Bus Data Receiver",
          "roleDefinitionId": "4f6d3b9b-027b-4f4c-9142-0e5a2a2247e0",
          "intentTags": ["receive"]
        },
        {
          "roleName": "Azure Service Bus Data Sender",
          "roleDefinitionId": "69a216fc-b8fb-44d8-bc22-1f3c2cd27a39",
          "intentTags": ["send"]
        },
        {
          "roleName": "Azure Service Bus Data Owner",
          "roleDefinitionId": "090c5cfd-751d-490a-894a-3ce6f1109419",
          "intentTags": ["full"]
        }
      ]
    },
    {
      "key": "eventhubs",
      "label": "Azure Event Hubs (event hubs and consumer groups)",
      "targetResource": {
        "provider": "Microsoft.EventHub",
        "resourceType": "namespaces",
        "commonChildScopes": [
          "namespaces/eventhubs",
          "namespaces/eventhubs/consumergroups"
        ]
      },
      "roles": [
        {
          "roleName": "Azure Event Hubs Data Receiver",
          "roleDefinitionId": "a638d3c7-ab3a-418d-83e6-5f17a39d4fde",
          "intentTags": ["consume"]
        },
        {
          "roleName": "Azure Event Hubs Data Sender",
          "roleDefinitionId": "2b629674-e913-4c01-ae53-ef4638d8f975",
          "intentTags": ["produce"]
        },
        {
          "roleName": "Azure Event Hubs Data Owner",
          "roleDefinitionId": "f526a384-b230-433a-b45c-95f59c4a2dec",
          "intentTags": ["full"]
        }
      ]
    },
    {
      "key": "keyvault.secrets",
      "label": "Azure Key Vault: Secrets (RBAC permission model)",
      "targetResource": {
        "provider": "Microsoft.KeyVault",
        "resourceType": "vaults"
      },
      "roles": [
        {
          "roleName": "Key Vault Secrets User",
          "roleDefinitionId": "4633458b-17de-408a-b874-0445c86b69e6",
          "intentTags": ["readSecretValue"]
        },
        {
          "roleName": "Key Vault Secrets Officer",
          "roleDefinitionId": "b86a8fe4-44ce-4948-aee5-eccb2c155cd7",
          "intentTags": ["manageSecrets"]
        },
        {
          "roleName": "Key Vault Reader",
          "roleDefinitionId": "21090545-7ca7-4776-b22c-e363652d74d2",
          "intentTags": ["readMetadata"]
        },
        {
          "roleName": "Key Vault Administrator",
          "roleDefinitionId": "00482a5a-887f-4fb3-b363-3b7fe8e74483",
          "intentTags": ["fullDataPlane"]
        },
        {
          "roleName": "Key Vault Data Access Administrator",
          "roleDefinitionId": "8b54135c-b56d-4d72-a534-26097cfdc8d8",
          "intentTags": ["manageRoleAssignmentsForKeyVaultDataPlaneRoles"]
        }
      ],
      "constraints": [
        "These roles apply only when the vault uses the Azure role-based access control permission model."
      ]
    }
  ],
  "genericRoles": [
    { "roleName": "Reader", "roleDefinitionId": "acdd72a7-3385-48ef-bd42-f606fba81ae7" },
    { "roleName": "Owner", "roleDefinitionId": "8e3af657-a8ff-443c-a75c-2fe8c4bcb635" },
    { "roleName": "Role Based Access Control Administrator", "roleDefinitionId": "f58310d9-a9f6-439a-9e8d-f62e7b41a168" },
    { "roleName": "User Access Administrator", "roleDefinitionId": "18d7d88d-d35e-4fb5-a5c3-7773c20a72d9" }
  ]
}
```

Storage Blob Data role IDs and names are canonical as documented in Azure built-in roles for Storage. ([Microsoft Learn][5])
Storage Queue Data role IDs and names are canonical as documented in Azure built-in roles for Storage. ([Microsoft Learn][5])
Storage Table Data role IDs and names are canonical as documented in Azure built-in roles for Storage. ([Microsoft Learn][5])
Service Bus Data role IDs and names are canonical as documented in Azure built-in roles for Integration. ([Microsoft Learn][6])
Event Hubs Data role IDs and names are canonical as documented in Azure built-in roles for Analytics. ([Microsoft Learn][6])
Key Vault role IDs and names are canonical as listed in Azure built-in roles (and apply to the RBAC permission model). ([Microsoft Learn][3])

Z60 Storage-specific guidance invariants (used by the text generator)

For the app's generated guidance, use these deterministic statements:

1. For Storage data access using Microsoft Entra identities (users, service principals, managed identities), grant a data-plane role (for example, Storage Blob Data Contributor) at an appropriate scope (storage account or container). These roles are data-plane roles and do not inherently grant ARM management permissions. ([Microsoft Learn][5])

2. If the user expects to browse the resource in the Azure portal, also grant Reader at the storage account scope (or higher) when appropriate, because Reader provides view-only ARM access and does not grant data access. ([Microsoft Learn][4])

Z70 Cross-subscription reference rules (used by the "from this subscription / other subscription" selector)

Use these rules to avoid incorrect guidance:

1. Role assignments must be created at a scope that exists in the subscription that contains the target resource. If the resource is in a different subscription, the role assignment must be created in that target subscription at the resource's scope (or a parent scope within that target subscription). This follows the general Azure RBAC scope model. ([Microsoft Learn][1])

2. The actor performing the assignment must have roleAssignments/write permission at that target scope. If the actor only has such permission in the source subscription, the tool must warn that the assignment cannot be created until access is granted in the target subscription. ([Microsoft Learn][2])

Z80 Optional: Azure Data Explorer (Kusto) RBAC reference (dual-layer note)

Azure Data Explorer commonly involves two layers: Azure RBAC roles that control management-plane operations on the cluster resource and Kusto-specific roles (such as database-level roles) that control data-plane access. When you include "Kusto / Azure Data Explorer" in the service selector, the tool should offer a "Which layer?" choice: "Azure RBAC (manage cluster)" vs "Kusto database roles (query/ingest/admin)". Kusto database roles like Viewer and Ingestor are documented as Kusto-level roles, separate from Azure RBAC. ([docs.azure.cn][7])

[1]: https://learn.microsoft.com/en-us/azure/role-based-access-control/role-definitions-list?utm_source=chatgpt.com "List Azure role definitions"
[2]: https://learn.microsoft.com/en-us/azure/role-based-access-control/role-assignments-rest?utm_source=chatgpt.com "Assign Azure roles using the REST API - Azure RBAC"
[3]: https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles "Azure built-in roles - Azure RBAC | Microsoft Learn"
[4]: https://learn.microsoft.com/en-us/azure/storage/blobs/assign-azure-role-data-access?utm_source=chatgpt.com "Assign an Azure role for access to blob data"
[5]: https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/storage "Azure built-in roles for Storage - Azure RBAC | Microsoft Learn"
[6]: https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/integration "Azure built-in roles for Integration - Azure RBAC | Microsoft Learn"
[7]: https://docs.azure.cn/en-us/data-explorer/kusto/access-control/role-based-access-control?view=azure-data-explorer&utm_source=chatgpt.com "Role-based access control | Azure Docs"
