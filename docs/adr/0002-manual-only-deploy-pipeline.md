# Deploy pipeline stays manual-trigger-only

The CI config (carried over from the previous "delights" project) restricts the pipeline to `$CI_PIPELINE_SOURCE == "web"`, meaning pushes to `main` do **not** auto-build or auto-deploy — someone has to click "Run pipeline" in the GitLab UI. This was a deliberate choice (confirmed, not just inherited silently): it acts as a safety net against half-finished commits going live automatically. Don't "fix" this into an on-push pipeline without checking first.
