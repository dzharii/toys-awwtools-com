# Rate Limiter Notes
FIXTURE_ROMAN_RATE_LIMIT_TITLE

This note is for train reading. It must work on mobile.

## Token bucket idea

A bucket has capacity. Tokens refill over time. A request consumes one token.
If no token is available, reject or delay the request.

## Pseudocode

```txt
state:
  capacity = 100
  tokens = 100
  refill_rate = 10 tokens per second
  last_refill = now

on_request(user_id):
  elapsed = now - last_refill
  tokens = min(capacity, tokens + elapsed * refill_rate)
  last_refill = now

  if tokens >= 1:
    tokens = tokens - 1
    allow request
  else:
    reject request
```

## Trade-offs

| Approach       | Good for        | Risk            |
| -------------- | --------------- | --------------- |
| Fixed window   | simple counters | boundary bursts |
| Sliding window | smoother limits | more storage    |
| Token bucket   | burst tolerant  | clock bugs      |
| Leaky bucket   | steady output   | queue pressure  |

## Link reminders

- RFC 6585 status 429: https://www.rfc-editor.org/rfc/rfc6585
- Redis sorted sets are useful, but do not make the reader fetch anything.

End. FIXTURE_ROMAN_RATE_LIMIT_END
