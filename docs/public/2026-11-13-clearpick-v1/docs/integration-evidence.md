# Exporter protocol evidence

The user-supplied .devtools attachment is a HAR containing 158 network requests. Three captured problemsetQuestionListV2 responses cover skip values 0, 100 and 200, with limit 100. They report the same query input type, empty filter structure and all-code-essentials category used by bookmarklet.js. Observed statuses are SOLVED, TO_DO and ATTEMPTED. Frontend IDs differ from internal IDs, so only questionFrontendId is exported.

A separate captured globalData operation confirms userStatus supports isSignedIn and username. The exporter requests only those two fields. The supplied JavaScript bookmarklet confirms POST /graphql/, credentials same-origin, optional x-csrftoken and GraphQL errors handling. Neither the full HAR nor its account/session data is included here.

The current exporter narrows the observed query to:

```graphql
query ClearpickProgress(
  $filters: QuestionFilterInput,
  $limit: Int,
  $skip: Int,
  $categorySlug: String
) {
  problemsetQuestionListV2(
    filters: $filters,
    limit: $limit,
    skip: $skip,
    categorySlug: $categorySlug
  ) {
    questions { questionFrontendId status }
    totalLength
    hasMore
  }
}
```

A recent accepted-submissions endpoint was intentionally rejected: its bounded history cannot establish all solved problems. The captured list protocol is still undocumented and must be tested against a signed-in live account before live compatibility can be claimed. Mocked tests validate full pagination, duplicate detection, total drift, malformed status, failures and account changes; they cannot establish live permission or schema stability.

Reference implementations and current terms were consulted on 2026-11-13:

https://github.com/emacsmirror/leetcode/blob/master/leetcode.el

https://github.com/iloy/leetcode-helper/blob/main/graphql.sh

https://leetcode.com/terms/
