#!/usr/bin/env bash
# Install system dependencies for pandas, numpy, scipy, etc.
apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libatlas-base-dev \
    gfortran \
    libffi-dev \
    libssl-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libjpeg-dev \
    libblas-dev \
    liblapack-dev \
    pkg-config

pip install --upgrade pip
pip install -r requirements.txt
