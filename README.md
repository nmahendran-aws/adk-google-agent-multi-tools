# Zoo Agent Setup and Deployment

This guide outlines the steps to set up the environment and deploy the Zoo Agent to Google Cloud Run using `google-adk`.

## Prerequisites

- Python 3.10+
- Google Cloud SDK (`gcloud`)
- Docker (for local testing or if `adk` builds containers locally)

## Setup Instructions

1.  **Install Python Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Install Google Cloud SDK** (if not already installed)
    *   **macOS (via Homebrew):**
        ```bash
        brew install --cask google-cloud-sdk
        ```
    *   **Other OS:** Follow [official documentation](https://cloud.google.com/sdk/docs/install).

3.  **Authenticate with Google Cloud**
    Login to your Google Cloud account:
    ```bash
    gcloud auth login
    ```

4.  **Configure Project**
    Set your active project (replace `YOUR_PROJECT_ID` with your actual Project ID, e.g., `mahen-projects`):
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```

    *Optional: Set a default region*
    ```bash
    gcloud config set run/region us-central1
    ```

## Deployment

To deploy the agent to Google Cloud Run, use the `adk` CLI.

### Basic Deployment
If you have configured your default project and region:
```bash
adk deploy cloud_run .
```

### Deployment with Explicit Arguments
To explicitly specify the project and region, pass them as `gcloud` arguments after `--`:

```bash
adk deploy cloud_run . -- --project=YOUR_PROJECT_ID --region=us-central1
```

### Deployment with Explicit Arguments
To explicitly specify the project and region, pass them as `gcloud` arguments after `--`:
```bash
uvx --from google-adk \
adk deploy cloud_run \
  --project=$PROJECT_ID \
  --region=europe-west1 \
  --service_name=zoo-tour-guide \
  --with_ui \
  . \
  -- \
  --labels=dev-tutorial=codelab-adk \
  --service-account="agent-service-account@mahen-projects.iam.gserviceaccount.com"
```

## Troubleshooting

- **gcloud not found**: Ensure `gcloud` is in your PATH. If installed via Homebrew, you might need to source the path files or restart your terminal.
- **Permissions**: Ensure your user has the necessary permissions (Cloud Run Admin, Service Account User, etc.) on the project.
