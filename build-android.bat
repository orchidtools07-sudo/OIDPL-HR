@echo off
cd /d E:\OIDPL-ONE\OIDPL-HR-App
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
echo Building Android app for emulator (x86_64 only)...
cd android
.\gradlew.bat assembleDebug -PreactNativeArchitectures=x86_64
