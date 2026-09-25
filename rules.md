rules.md
    

make a rules for PowerShell script that checks for specific conditions and performs actions based on those conditions. Here are some example rules:1. Rule: Check if a specific file exists
   - Condition: If the file "C:\example\file.txt" exists
   - Action: Output "File exists" to the console2. Rule: Check if a specific service is running
   - Condition: If the service "Spooler" is running     

    - Action: Output "Spooler service is running" to the console3. Rule: Check if a specific process is running
    - Condition: If the process "notepad.exe" is running
    - Action: Output "Notepad is running" to the console4. Rule: Check if a specific registry key exists
    - Condition: If the registry key "HKLM:\Software\MyApp" exists
    - Action: Output "Registry key exists" to the console5. Rule: Check if a specific environment variable is set
    - Condition: If the environment variable "MY_ENV_VAR" is set
    - Action: Output "Environment variable is set" to the console
Here is a PowerShell script that implements the specified rules:```powershell
# Rule 1: Check if a specific file exists   
$filePath = "C:\example\file.txt"
if (Test-Path $filePath) {
    Write-Output "File exists"
} else {
    Write-Output "File does not exist"
}   
# Rule 2: Check if a specific service is running
$serviceName = "Spooler"
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue 
if ($service -and $service.Status -eq 'Running') {
    Write-Output "Spooler service is running"
} else {
    Write-Output "Spooler service is not running"
}

# Rule 3: Check if a specific process is running
$processName = "notepad.exe"
$process = Get-Process -Name $processName -ErrorAction SilentlyContinue 

if ($process) {
    Write-Output "Notepad is running"
} else {
    Write-Output "Notepad is not running"
}   

# Rule 4: Check if a specific registry key exists
$registryPath = "HKLM:\Software\MyApp"  
if (Test-Path $registryPath) {
    Write-Output "Registry key exists"
} else {
    Write-Output "Registry key does not exist"
}


# Rule 5: Check if a specific environment variable is set
$envVarName = "MY_ENV_VAR"
if ($env:$envVarName) {
    Write-Output "Environment variable is set"
} else {
    Write-Output "Environment variable is not set"
}

    6. Rule: Check if the system uptime is greater than a specific threshold
   - Condition: If the system uptime is greater than 1 day (24 hours)
    - Action: Output "System uptime is greater than 1 day" to the console
# Rule 6: Check if the system uptime is greater than a specific threshold
$uptimeThreshold = 1 # in days
$uptime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$uptimeDays = (Get-Date) - $uptime
if ($uptimeDays.TotalDays -gt $uptimeThreshold) {
    Write-Output "System uptime is greater than 1 day"
} else {
    Write-Output "System uptime is less than or equal to 1 day"
}

    7. Rule: Check if a specific network adapter is enabled
   - Condition: If the network adapter "Ethernet" is enabled        
- Action: Output "Ethernet adapter is enabled" to the console
# Rule 7: Check if a specific network adapter is enabled    
$adapterName = "Ethernet"
$adapter = Get-NetAdapter -Name $adapterName -ErrorAction SilentlyContinue
if ($adapter -and $adapter.Status -eq 'Up') {
    Write-Output "Ethernet adapter is enabled"
} else {
    Write-Output "Ethernet adapter is not enabled"
}

8. Rule: Check if a specific Windows feature is installed
   - Condition: If the Windows feature "TelnetClient" is installed
   - Action: Output "Telnet Client feature is installed" to the console
# Rule 8: Check if a specific Windows feature is installed
$featureName = "TelnetClient"   
$feature = Get-WindowsFeature -Name $featureName -ErrorAction SilentlyContinue
if ($feature -and $feature.Installed) {
    Write-Output "Telnet Client feature is installed"
} else {
    Write-Output "Telnet Client feature is not installed"
}



LAYERED ARCHITECTURE

FRONT-END :  HTML, CSS, JAVASCRIPT, JQUERY, AJAX, BOOTSTRAP, ANGULAR, REACT, VUE.JS
BACK-END :  NODE.JS
STYLING : TAILWIND CSS, SASS, LESS
DATABASE :  MYSQL
AUTHENTICATION :  JWT
STORAGE :  AWS S3
DEPLOYMENT :  DOCKER
VERSION CONTROL :  GIT, GITHUB

general folder structure for the WorkZen HRMS platform:
- src/

    - components/ # Reusable UI components  
    - services/ # API service calls
    - models/ # Data models
    - views/ # UI views/pages
    - assets/ # Static assets like images, fonts, etc.
    - utils/    # Utility functions
    - config/   # Configuration files
    - index.js  # Entry point of the application
    - package.json # Project metadata and dependencies
    - README.md # Project documentation
    - .env # Environment variables
    - .gitignore # Git ignore file
    - Dockerfile # Docker configuration
    - docker-compose.yml # Docker Compose configuration
    - tests/ # Unit and integration tests
    - public/ # Publicly accessible files
    - routes/ # API route definitions
    - FUNCTIONALITY/ # Specific modules for different functionalities