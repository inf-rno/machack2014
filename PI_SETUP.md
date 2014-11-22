npm install johnny-five
npm install raspi-io

#TODO

Make it run on boot
su pi -c 'node /home/pi/server.js < /dev/null &'
http://weworkweplay.com/play/raspberry-pi-nodejs/


# ON REBOOT?

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Run WebGame on PI
sudo node app