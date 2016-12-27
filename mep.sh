#!/bin/sh
# MISE EN PRODUCTION
# cd git/reacteur
# chmod +x mep.sh
# sudo /mep.sh

systemctl stop reacteur.service
npm run build
systemctl start reacteur.service
