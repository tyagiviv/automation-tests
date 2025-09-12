import requests
import zipfile
import os
from datetime import datetime

# === Config ===
GITHUB_REPO = "tyagiviv/automation-tests"  # your repo
WORKFLOW_NAME = "playwright-hourly.yml"    # workflow filename in .github/workflows
LOCAL_REPORTS_DIR = "/Users/v/playwright-pom-framework/reports"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")  # set this as env var

# === Headers for GitHub API ===
headers = {}
if GITHUB_TOKEN:
    headers["Authorization"] = f"token {GITHUB_TOKEN}"

# 1️⃣ Get latest workflow runs
runs_url = f"https://api.github.com/repos/{GITHUB_REPO}/actions/workflows/{WORKFLOW_NAME}/runs"
runs_resp = requests.get(runs_url, headers=headers)
runs_resp.raise_for_status()
runs = runs_resp.json().get("workflow_runs", [])

if not runs:
    print("No workflow runs found.")
    exit()

total_extracted = 0

# Process each run
for latest_run in runs:
    run_id = latest_run["id"]
    run_time = datetime.strptime(latest_run["created_at"], "%Y-%m-%dT%H:%M:%SZ")
    run_folder_name = run_time.strftime("%Y-%m-%dT%H-%M-%S") + "-000Z"  # timestamp style
    run_dir = os.path.join(LOCAL_REPORTS_DIR, run_folder_name)
    os.makedirs(run_dir, exist_ok=True)

    print(f"\nProcessing workflow run: {run_id} -> Folder: {run_folder_name}")

    # 2️⃣ Get artifacts for the run
    artifacts_url = f"https://api.github.com/repos/{GITHUB_REPO}/actions/runs/{run_id}/artifacts"
    artifacts_resp = requests.get(artifacts_url, headers=headers)
    artifacts_resp.raise_for_status()
    artifacts = artifacts_resp.json().get("artifacts", [])

    if not artifacts:
        print(f"No artifacts found for run {run_id}")
        continue

    # 3️⃣ Find html-report artifact
    artifact = next((a for a in artifacts if a["name"] == "html-report"), None)
    if not artifact:
        print("html-report artifact not found.")
        continue

    download_url = artifact["archive_download_url"]
    print(f"Downloading artifact from: {download_url}")

    # 4️⃣ Download artifact ZIP to temporary file
    zip_path = os.path.join(run_dir, "html-report.zip")
    with requests.get(download_url, headers=headers, stream=True) as r:
        r.raise_for_status()
        with open(zip_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

    # 5️⃣ Extract ZIP, skipping existing files
    extracted_files = []
    with zipfile.ZipFile(zip_path, "r") as z:
        for member in z.namelist():
            target_path = os.path.join(run_dir, member)
            if not os.path.exists(target_path):
                z.extract(member, run_dir)
                extracted_files.append(target_path)

    # 6️⃣ Delete ZIP file
    os.remove(zip_path)

    folder_count = len(extracted_files)
    total_extracted += folder_count

    print(f"Report for run {run_id} extracted to: {run_dir}")
    print(f"Number of new files extracted in this folder: {folder_count}")
    for f in extracted_files:
        print(f" - {f}")

print(f"\n✅ Total new files extracted across all runs: {total_extracted}")
