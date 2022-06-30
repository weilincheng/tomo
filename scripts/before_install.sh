#!/bin/bash

# Download node and npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
. ~/.nvm/nvm.sh
nvm install --lts

# Create working directory if it doesn't exist
DIR="/home/ec2-user/tomo"
if [ -d "$DIR" ]; then
  echo "${DIR} exists" 
else
  echo "Creating ${DIR} directory"
  mkdir ${DIR}
fi
