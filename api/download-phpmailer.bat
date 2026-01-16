@echo off
echo Downloading PHPMailer...
curl -o PHPMailer-master.zip https://github.com/PHPMailer/PHPMailer/archive/6.9.1.zip
echo Extracting...
powershell -Command "Expand-Archive -Path 'PHPMailer-master.zip' -DestinationPath '.'"
echo Done!
pause
