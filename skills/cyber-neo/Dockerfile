FROM python:3.12-slim

LABEL maintainer="SkillGrid" \
      description="Cyber Neo — containerized security audit toolchain" \
      org.skillgrid.agent="cyber-neo"

SHELL ["/bin/bash", "-c"]

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    ca-certificates \
    git \
    jq \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    semgrep==1.169.0 \
    trufflehog==2.2.1 \
    checkov==3.3.8 \
    bandit==1.9.4 \
    safety==3.8.1 \
    pip-audit==2.10.1

RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.60.0

RUN curl -sfL https://raw.githubusercontent.com/zricethezav/gitleaks/master/install.sh | sh -s -- -b /usr/local/bin v8.24.0

RUN curl -sfL https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_3.4.0_linux_amd64.deb -o /tmp/nuclei.deb \
    && dpkg -i /tmp/nuclei.deb && rm /tmp/nuclei.deb

COPY scripts/ /opt/cyber-neo/scripts/
COPY references/ /opt/cyber-neo/references/

WORKDIR /workspace

ENTRYPOINT ["/bin/bash"]
