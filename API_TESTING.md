# API Test Script - Quick Reference

## Run Tests

```bash
npm run test:api
```

## What Gets Tested

### Module 1: Authentication (8 endpoints)
- ✓ POST /api/auth/register
- ✓ POST /api/auth/login
- ✓ GET /api/auth/me
- ✓ POST /api/auth/refresh
- ✓ POST /api/auth/wallet/nonce
- ⊘ POST /api/auth/wallet/verify (requires signature)
- ⊘ POST /api/auth/wallet/link (requires signature)
- ✓ POST /api/auth/logout

### Module 2: Users (7 endpoints)
- ✓ GET /api/users/:id
- ✓ PUT /api/users/:id
- ✓ POST /api/users/:id/follow
- ✓ DELETE /api/users/:id/follow
- ✓ GET /api/users/bookmarks
- ✓ POST /api/users/bookmarks
- ✓ DELETE /api/users/bookmarks/:id

### Module 3: Posts (10 endpoints)
- ✓ GET /api/posts
- ✓ GET /api/posts/search
- ✓ GET /api/posts/:id
- ✓ POST /api/posts
- ✓ PUT /api/posts/:id
- ✓ POST /api/posts/:id/vote
- ✓ GET /api/posts/:id/comments
- ✓ POST /api/posts/:id/comments
- ✓ POST /api/posts/:id/share
- ✓ DELETE /api/posts/:id

### Module 4: Polls (6 endpoints)
- ✓ GET /api/polls
- ✓ GET /api/polls/:id
- ✓ POST /api/polls
- ✓ POST /api/polls/:id/vote
- ✓ PUT /api/polls/:id
- ✓ DELETE /api/polls/:id

### Module 5: Communities (7 endpoints)
- ✓ GET /api/communities
- ✓ GET /api/communities/:id
- ✓ POST /api/communities
- ✓ PUT /api/communities/:id
- ✓ POST /api/communities/:id/join
- ✓ GET /api/communities/:id/posts
- ✓ DELETE /api/communities/:id/leave

### Module 6: Bowls (5 endpoints)
- ✓ GET /api/bowls
- ✓ GET /api/bowls/:id
- ✓ POST /api/bowls
- ✓ POST /api/bowls/:id/join
- ✓ DELETE /api/bowls/:id/leave

### Module 7: Companies (8 endpoints)
- ✓ GET /api/companies
- ✓ GET /api/companies/:id
- ✓ POST /api/companies
- ✓ POST /api/companies/:id/sentiment
- ✓ GET /api/companies/:id/posts
- ✓ GET /api/companies/:id/markets
- ✓ POST /api/companies/:id/markets
- ✓ POST /api/companies/:id/markets/:marketId/trade

### Module 8: Notifications (6 endpoints)
- ✓ GET /api/notifications
- ⊘ PUT /api/notifications/:id/read
- ✓ PUT /api/notifications/read-all
- ✓ POST /api/notifications/device-token
- ✓ PUT /api/notifications/settings
- ✓ DELETE /api/notifications/device-token

### Module 9: Feed (3 endpoints)
- ✓ GET /api/feed/recommended
- ✓ GET /api/feed/following
- ✓ GET /api/feed/for-you

### Module 10: Wallet (6 endpoints)
- ✓ GET /api/wallet
- ⊘ POST /api/wallet/link (requires signature)
- ⊘ GET /api/wallet/:id/balance
- ✓ POST /api/wallet/sign
- ✓ POST /api/wallet/verify
- ⊘ DELETE /api/wallet/:id/unlink

### System (4 endpoints)
- ✓ GET /
- ✓ GET /health
- ✓ GET /api-docs/swagger.json
- ✓ GET /api-docs

## Test Credentials

- Email: `alice@example.com`
- Password: `password123`

## Understanding Test Results

- **✓ PASS**: Endpoint working correctly
- **✗ FAIL**: Endpoint has issues
- **⊘ SKIP**: Requires manual testing (e.g., wallet signatures)

## Next.js Integration

See `NEXTJS_INTEGRATION.md` for complete frontend integration guide.

### Quick Example

```typescript
// In your Next.js component
import { postsAPI } from '@/lib/api/posts';

export default async function PostsPage() {
  const { data } = await postsAPI.getAll({ page: 1, limit: 10 });
  
  return (
    <div>
      {data.posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
```

## Customizing Tests

Edit `scripts/test-api.js` to:
- Add new test cases
- Modify test data
- Skip/enable specific tests
- Add custom assertions

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run API Tests
  run: npm run test:api
```
