#!/bin/bash
# Deploy PetroSim frontend to S3 + invalidate CloudFront cache
# Usage: ./deploy-frontend.sh [bucket-name] [distribution-id]

set -e

BUCKET_NAME="${1:-petrosim-frontend}"
DISTRIBUTION_ID="${2:-}"
REGION="${AWS_DEFAULT_REGION:-eu-west-3}"
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "=== Building frontend ==="
cd "$ROOT_DIR/apps/web"
pnpm build

echo "=== Uploading to S3 ==="
aws s3 sync dist/ "s3://$BUCKET_NAME/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.json" \
  --region "$REGION"

# index.html and JSON should not be cached long
aws s3 cp dist/index.html "s3://$BUCKET_NAME/index.html" \
  --cache-control "public, max-age=60" \
  --content-type "text/html" \
  --region "$REGION"

echo "=== Frontend deployed to s3://$BUCKET_NAME ==="

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "=== Invalidating CloudFront cache ==="
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --region "$REGION"
  echo "=== CloudFront invalidation requested ==="
fi

echo "Done."
