$stream = "2026/03/19/`$LATEST`]4dad20b31c59481295be413dfcba4be1"
aws logs get-log-events --log-group-name "/aws/lambda/petrosim-PetroSimApi-xgLJ6533MK24" --log-stream-name "2026/03/19/[`$LATEST]4dad20b31c59481295be413dfcba4be1" --profile fabien-develop-admin --region eu-west-3 --limit 30 --query "events[].message" --output text
