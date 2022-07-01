#!/bin/bash
sudo chmod -R 777 /home/ec2-user/tomo
cd /home/ec2-user/tomo

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

npm install
#node index.js > app.out.log 2> app.err.log < /dev/null &
pm2 start tomo
