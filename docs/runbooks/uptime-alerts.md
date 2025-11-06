# Uptime Alerts (Cloud Monitoring)

This runbook configures an alert policy that fires when uptime checks fail for more than 2 minutes.

## Prerequisites

- gcloud CLI authenticated with Monitoring Admin
- API enabled: monitoring.googleapis.com
- An existing Uptime Check targeting your public URL (configure in Monitoring > Uptime checks)
- A notification channel (Slack or Email). Get the channel ID from Monitoring > Alerting > Notification channels.

## Steps

1. Edit the policy JSON to include your project and channel:

```bash
sed -i 's/PROJECT_ID/my-project/g; s/CHANNEL_ID/1234567890/g' scripts/ops/uptime-alert-policy.json
```

2. Create the alert policy via gcloud:

```bash
PROJECT_ID=my-project \
CHANNEL_ID=1234567890 \
./scripts/ops/create-uptime-alert.sh
```

3. Test by disabling your service or changing uptime check target temporarily.

4. Verify alerts arrive in Slack/Email.

## Notes

- You can create multiple alert policies for different services or environments by duplicating the JSON.
- For more granular alerts (latency, error rate, SLO burn-rate), add additional conditions.
