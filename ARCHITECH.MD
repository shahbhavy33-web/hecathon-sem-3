ARCHITECT : '.\02 _WorkZen_HRMS_Problem_Statement (1).pdf'
ARCHITECT : '.\PRD.MD'

HIGH LEVEL DESIGN : '.\03 _WorkZen_HRMS_HLD (1).pdf'
USER STORIES ----> UI/EMPLOYEE ----> UI/HRMS ----> UI/ADMIN ----> UI/REPORTS ----> UI/SETTINGS ----> UI/NOTIFICATIONS ----> UI/DASHBOARD
----> UI/LEAVE MANAGEMENT ----> UI/ATTENDANCE ----> UI/PAYROLL ----> UI/RECRUITMENT ----> UI/TRAINING ----> UI/FEEDBACK



TECHNICAL DESIGN : '.\04 _WorkZen_HRMS_TDD (1).pdf'

LAYERED ARCHITECTURE

FRONT-END :  HTML, CSS, JAVASCRIPT, JQUERY, AJAX, BOOTSTRAP, ANGULAR, REACT, VUE.JS
BACK-END :  NODE.JS
STYLING : TAILWIND CSS, SASS, LESS
DATABASE :  MYSQL
AUTHENTICATION :  JWT
STORAGE :  AWS S3
DEPLOYMENT :  DOCKER
VERSION CONTROL :  GIT, GITHUB

FOLDREER STRUCTURE :
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
    -FUNCTIONALITY/ # Specific modules for different functionalities
      

      WORKZEN HRMS PLATFORM WORKFLOW:
1. User Authentication and Authorization:
    - Users can register and log in to the platform using secure authentication methods (e.g., JWT).
     - Role-based access control ensures that users have appropriate permissions based on their roles (e.g., employee, HR manager, admin).
     - Password recovery and multi-factor authentication options enhance security.

2. Employee Management:
    - HR managers can add, update, and manage employee profiles, including personal information, job details, and employment history.
    - Employees can view and update their own profiles through the self-service portal.
    - Integration with external HR tools allows for seamless data synchronization.

3. Attendance Management:
    - Employees can clock in and clock out using the platform, with timestamps recorded for accurate attendance tracking.
    - Leave requests can be submitted by employees and routed to HR managers for approval.  

4. Payroll Management:
    - The system calculates salaries based on attendance, leave, and other relevant factors.
    - Payslips are generated and distributed to employees electronically.
    - Integration with banking systems enables direct salary disbursement.

5. Analytics and Reporting:
    - Real-time dashboards provide insights into HR metrics, such as employee attendance, leave balances, and payroll summaries.
    - Customizable reports can be generated for management review, with options to export in various formats (PDF, Excel, etc.).

    6. Notifications and Alerts:
    - Automated notifications are sent to employees and HR managers for important events, such as leave approvals   and payroll processing.
    - Users can customize alert settings to receive notifications via email or messaging platforms.     


    7. Compliance and Legal Management:
    - The platform tracks labor law compliance and regulations, providing automated reminders for upcoming deadlines.       
    - Documentation management features allow HR managers to store and access legal and HR policy documents securely.

     Backend Scaffolding (1:15–2:30)

**File structure:**
```
workzen/
  ├── app.py                 # Flask app + routes
  ├── models.py              # SQLAlchemy models
  ├── auth.py                # JWT helpers
  ├── database.db            # SQLite (auto-created)
  └── templates/
      └── (not used — API only for this build)
  └── static/
      ├── index.html         # Frontend
      ├── styles.css         # Tailwind
      └── script.js          # Vanilla JS
```