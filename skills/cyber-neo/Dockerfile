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
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    semgrep==1.169.0 \
    checkov==3.3.8 \
    bandit==1.9.4 \
    safety==3.8.1 \
    pip-audit==2.10.1

# Standalone binaries: pinned release + SHA-256 verification (no `curl | sh`,
# no floating "latest" URLs, so upstream re-tagging cannot silently break the build).
# 0.73.0/0.74.0 release assets returned HTTP 504 from GitHub's CDN at time of pinning; 0.72.0 downloads reliably.
ARG TRIVY_VERSION=0.72.0
ARG GITLEAKS_VERSION=8.24.0
ARG NUCLEI_VERSION=3.11.1
ARG TRUFFLEHOG_VERSION=3.97.5

RUN set -eux; cd /tmp; \
    fetch() { \
        url_base="$1"; asset="$2"; sums="$3"; \
        curl -fsSLO --retry 5 --retry-all-errors --retry-delay 3 "${url_base}/${asset}"; \
        curl -fsSLO --retry 5 --retry-all-errors --retry-delay 3 "${url_base}/${sums}"; \
        grep " ${asset}\$" "${sums}" | sha256sum -c -; \
    }; \
    fetch "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}" \
          "trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz" "trivy_${TRIVY_VERSION}_checksums.txt"; \
    tar -xzf "trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz" -C /usr/local/bin trivy; \
    fetch "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}" \
          "gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" "gitleaks_${GITLEAKS_VERSION}_checksums.txt"; \
    tar -xzf "gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" -C /usr/local/bin gitleaks; \
    fetch "https://github.com/trufflesecurity/trufflehog/releases/download/v${TRUFFLEHOG_VERSION}" \
          "trufflehog_${TRUFFLEHOG_VERSION}_linux_amd64.tar.gz" "trufflehog_${TRUFFLEHOG_VERSION}_checksums.txt"; \
    tar -xzf "trufflehog_${TRUFFLEHOG_VERSION}_linux_amd64.tar.gz" -C /usr/local/bin trufflehog; \
    fetch "https://github.com/projectdiscovery/nuclei/releases/download/v${NUCLEI_VERSION}" \
          "nuclei_${NUCLEI_VERSION}_linux_amd64.zip" "nuclei_${NUCLEI_VERSION}_checksums.txt"; \
    unzip -o "nuclei_${NUCLEI_VERSION}_linux_amd64.zip" nuclei -d /usr/local/bin; \
    chmod +x /usr/local/bin/trivy /usr/local/bin/gitleaks /usr/local/bin/trufflehog /usr/local/bin/nuclei; \
    rm -f /tmp/trivy_* /tmp/gitleaks_* /tmp/trufflehog_* /tmp/nuclei_*

COPY scripts/ /opt/cyber-neo/scripts/
COPY references/ /opt/cyber-neo/references/

WORKDIR /workspace

ENTRYPOINT ["/bin/bash"]
