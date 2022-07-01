#!/bin/bash
source /home/ec2-user/.bash_profile
echo "Stopping any existing node servers"
pm2 stop all