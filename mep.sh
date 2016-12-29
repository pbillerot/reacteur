#!/bin/sh
# MISE EN PRODUCTION
# cd git/reacteur
# sudo chmod +x mep.sh
# sudo ./mep.sh

systemctl stop reacteur.service
git reset -hard
git pull
npm run build
systemctl start reacteur.service
