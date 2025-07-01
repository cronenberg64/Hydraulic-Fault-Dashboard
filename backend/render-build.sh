#!/usr/bin/env bash
# Install system dependencies for pandas, numpy, etc.
apt-get update && apt-get install -y build-essential python3-dev libatlas-base-dev gfortran
pip install --upgrade pip
pip install -r requirements.txt
