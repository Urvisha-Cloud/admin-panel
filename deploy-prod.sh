#!/bin/bash

# Load nvm if installed
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Define variables
PROJECT_DIR="/root/admin-nexa"
GIT_BRANCH="prod"

# Log the start time
echo "Deployment started at: $(date)"

# Check if the project directory exists
if [ -d "$PROJECT_DIR" ]; then
  echo "Changing directory to $PROJECT_DIR"
  cd "$PROJECT_DIR" || exit 1

  # Verify git status
  echo "Current Git branch and status:"
  git status

  # Pull the latest code
  echo "Pulling latest code from Git branch $GIT_BRANCH"
  git pull origin "$GIT_BRANCH" || exit 1

  # Check if Node.js and npm are available
  echo "Checking Node.js version"
  node --version || exit 1

  echo "Checking npm version"
  npm --version || exit 1

  # Install  dependencies
  echo "Installing npm dependencies"
  npm install  || exit 1

    # Install Yarn dependencies
  echo "build create ...."
  npm run build || exit 1

  pm2 restart AD
  pm2 list

  echo "Deployment completed at: $(date)"
else
  echo "Error: Project directory $PROJECT_DIR does not exist."
  exit 1
fi
