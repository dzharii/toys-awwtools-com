---
file: ".openai/hosting.json"
---

This file identifies the existing hosted project and its deployable static directory.

<!-- at: 1 -->
## Publish dist to the retained site identity

`project_id` belongs to this site and must be preserved during updates. The hosting service reads `dist` as static assets. This manifest contains no credential; repository write credentials are temporary and are not stored here.

