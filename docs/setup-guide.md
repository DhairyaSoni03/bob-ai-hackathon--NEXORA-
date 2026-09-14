# Setup Guide

> **This file is read by the automated evaluation pipeline. Be precise and complete.**

## Prerequisites

Before you begin, ensure you have the following installed:

- [x] Python 3.11+
- [ ] Node.js — not required for the current implementation
- [ ] Docker Desktop — not required for the current implementation
- [ ] IBM Cloud / watsonx.ai account — not required for the current core proof of concept

## Environment Variables

The current NEXORA proof of concept does not require external API credentials to run.

The repository contains:

```text
src/.env.example

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/meett9668-boop/bob-ai-hackathon--NEXORA-.git
cd bob-ai-hackathon--NEXORA-

# 2. Install backend dependencies
pip install -r src/backend/requirements.txt

# 3. Install frontend dependencies (if applicable)
cd src/backend
python -m uvicorn main:app --host 127.0.0.1 --port 8001

# 4. Set up the database (if applicable)
[your command — e.g.: python manage.py migrate]
```

## Running the Application

```bash
# Start the backend and serve the application
cd src/backend
python -m uvicorn main:app --host 127.0.0.1 --port 8001

The application will be available at:

`http://127.0.0.1:8001`

## Running Tests

### Python Syntax Check

```bash
python -m compileall src/backend
