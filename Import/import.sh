function check_os() {
  os_name="$1"
  if [[ "$OSTYPE" == *"$os_name"* ]]; then
    echo "Running on $os_name"
    return 0  # Indicate success
  else
    return 1  # Indicate failure
  fi
}

# Check for Unix-based systems
if check_os "linux-gnu" || check_os "darwin"; then
  # Execute the command for Unix-based systems
    echo "Lucky you! it is not a windows machine!"
    rm *.html *.xml

    python3 import.py 610 
    zip -r CCCS610.zip *.html *.xml
    rm *.html *.xml

    python3 import.py 620 
    zip -r CCCS620.zip *.html *.xml
    rm *.html *.xml

    python3 import.py 660 
    zip -r CCCS660.zip *.html *.xml
    rm *.html *.xml

# Check for Windows environment (native or Cygwin/MSYS)
elif [[ "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
  # Execute the command for Windows
    echo "This is a Windows system. Install 7z (https://www.7-zip.org/download.html)"
    rm *.html *.xml *.zip

    python3 import.py 610 
    7z a CCCS610.zip CCCS610-*.html CCCS610-*.xml
    rm *.html *.xml

    python3 import.py 620 
    7z a CCCS620.zip CCCS620-*.html CCCS620-*.xml
    rm *.html *.xml

    python3 import.py 660 
    7z a CCCS660.zip CCCS660-*.html CCCS660-*.xml
    rm *.html *.xml

fi