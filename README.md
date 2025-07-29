# KRILI 

 KRILI is a web-based platform designed to facilitate peer-to-peer product rentals. The application allows users to list, search, and rent various items securely, with a focus on ease of use, robust security, and multilingual support (notably French and Arabic). Below is a thorough overview of the repository, its structure, main components, features, and guidance for both users and contributors. 

 --- 

 ## Table of Contents 

 - [Project Overview](#project-overview) 
 - [Features](#features) 
 - [Directory and File Structure](#directory-and-file-structure) 
 - [Key Components](#key-components) 
 - [Security Mechanisms](#security-mechanisms) 
 - [Usage Instructions](#usage-instructions) 
 - [Setup and Installation](#setup-and-installation) 
 - [Contribution Guide](#contribution-guide) 
 - [Technical Details](#technical-details) 
 - [License](#license) 

 --- 

 ## Project Overview 

 KRILI provides a digital space where product owners can publish their items for rent, and users can easily search and book these items. The platform is built with a focus on security, accessibility, and user experience. It adopts modern web development practices and includes Progressive Web App (PWA) support for offline capabilities and enhanced performance. 

 --- 

 ## Features 

 - **User Registration & Authentication:** Secure login and registration forms with password strength validation and session management. 
 - **Item Listing & Search:** Users can view, search, and filter products, with rich item details and categories. 
 - **Product Rental Workflow:** Step-by-step rental process with digital contracts and notifications. 
 - **Security:** Comprehensive security features such as CSRF protection, XSS prevention, brute-force attack mitigation, and input validation. 
 - **Multilingual Support:** Content is available in both French and Arabic, making the platform accessible to a broader audience. 
 - **PWA Support:** Service worker integration for offline usage and improved performance. 
 - **User Experience Enhancements:** Responsive design, notification system, and prevention of common browser-based attacks (e.g., disabling right-click, dev tools shortcuts). 

 --- 

 ## Directory and File Structure 

 | File / Directory          | Description                                                                                 | 
 |--------------------------|---------------------------------------------------------------------------------------------| 
 | `login-test1.html`       | User login page with security scripts and validation.                                       | 
 | `register-test1.html`    | User registration form with password and input validation.                                  | 
 | `creat add.html`         | Main form for product listing; includes digital contract in French and Arabic.              | 
 | `item-test1.html`        | Detailed item view page, displaying product information and actions.                        | 
 | `rent-test1.html`        | Rental workflow page, includes PWA logic and browser security protections.                  | 
 | `search-test1.html`      | Item search and results page with filtering and listing components.                         | 
 | `security.js`            | Core security utilities: XSS/CSRF protection, input validation, encryption, etc.            | 
 | `auth-check.js`          | Authentication/session handling, login attempt tracking, password validation.                | 
 | `github emaile check.js` | (Referenced in login) – likely used for email validation with GitHub.                       | 
 | `sw.js`                  | Service Worker file for offline/PWA support.                                                | 

 --- 

 ## Key Components 

 ### 1. Authentication 

 - **auth-check.js:**   
   - Manages login session, tracks login attempts, implements session timeouts, and password strength enforcement. 
   - Sanitizes user input and validates credentials, with logic to lock out after repeated failed attempts. 

 - **register-test1.html & login-test1.html:**   
   - Forms for user registration and login, with client-side validation and feedback. 

 ### 2. Item Management 

 - **creat add.html:**   
   - Allows users to publish rental items through a multi-step form. 
   - Includes digital rental contract sections in both French and Arabic, covering parties, terms, fees, and obligations. 

 - **item-test1.html:**   
   - Displays detailed information for each product, including images, description, price, and actions (e.g., rent). 

 - **search-test1.html:**   
   - Provides search functionality with item filters, categories, and results listings. 

 ### 3. Rental Workflow 

 - **rent-test1.html:**   
   - Guides users through the rental process with interactive steps. 
   - Includes contract download, notifications, and service worker registration for PWA. 

 ### 4. Security 

 - **security.js:**   
   - Implements: 
     - XSS filtering (sanitizing user input) 
     - CSRF token generation and validation (added to all forms and AJAX requests) 
     - Password validation (length, case, numbers, special chars) 
     - Email and phone validation 
     - Brute-force attack prevention 
     - Security headers for external links and fetch requests 
     - Utility for encrypting/decrypting sensitive data (basic encoding) 
     - Automatic initialization of security features at DOM load 

 --- 

 ## Security Mechanisms 

 - **Cross-Site Scripting (XSS) Prevention:** Input is sanitized before display or submission. 
 - **CSRF Protection:** Unique tokens are generated for all forms and requests. 
 - **Brute-force Prevention:** Login attempts are tracked and accounts are locked after repeated failures. 
 - **Password and Input Validation:** Enforces strong password policies and validates emails/phones. 
 - **Session Management:** Sessions timeout after inactivity or upon logout. 
 - **Headers:** All external links and fetch requests use secure headers. 

 --- 

 ## Usage Instructions 

 1. **Clone the Repository:**    ```bash 
    git clone [https://github.com/Laadnanimoustapha/krili.git](https://github.com/Laadnanimoustapha/krili.git) 
    cd krili 
    ``` 

 2. **Open in Browser:**    - Open `login-test1.html` to log in or `register-test1.html` to create a new account. 
    - Use `creat add.html` to list new items for rent. 
    - Browse/search products via `search-test1.html` or view/rent items with `item-test1.html` and `rent-test1.html`. 

 3. **PWA Installation:**    - Open `rent-test1.html` in a supported browser. 
    - The service worker (`sw.js`) will register automatically for offline support. 

 4. **Digital Contracts:**    - During the rental workflow, contracts are shown in both French and Arabic for legal clarity. 
    - Contracts can be downloaded and saved as text files. 

 --- 

 ## Setup and Installation 

 > This project is primarily static HTML/JS/CSS and runs locally in the browser.   
 > There is **no backend/database connection** by default, but security logic is in place for when one is added. 

 ### Requirements 

 - Any modern web browser (Chrome, Firefox, Edge, Safari) 
 - (Optional) Local HTTP server for advanced PWA features 

 ### Running Locally 

 - Open the HTML files directly, or 
 - Serve the folder using a tool like `http-server` or Python's `http.server`: 
   ```bash 
   npx http-server . 
   # or 
   python3 -m http.server 
   ``` 

 --- 

 ## Contribution Guide 

 1. **Fork the Repository** and clone your fork. 
 2. **Create a Branch** for your feature or fix: 
    ```bash 
    git checkout -b feature/your-feature-name 
    ``` 
 3. **Make Changes, Test Locally** 4. **Submit a Pull Request** with a clear description of your changes. 
 5. **Follow Security Best Practices:**   
    - Do not commit sensitive information. 
    - Ensure all user inputs are validated and sanitized. 
    - Follow code style and structure of the project. 

 --- 

 ## Technical Details 

 - **Languages:** Primarily HTML, JavaScript, and CSS. 
 - **Security:** All forms are protected with CSRF tokens; passwords are checked for strength; brute-force protection is implemented. 
 - **Multilingual:** Key user-facing content is provided in both French and Arabic. 
 - **No Database:** The current version uses local/session storage and does not connect to a backend. Authentication logic is "mocked" for demo purposes. 
 - **Service Worker:** Registered for PWA/offline support in `rent-test1.html`. 
 - **Code Organization:**   
   - Each major page is a standalone HTML file with embedded or linked JS/CSS. 
   - Common logic is shared via `security.js` and `auth-check.js`. 

 --- 

 ## License 

 > **No license file present.**   
 > Please contact the repository owner regarding usage rights and licensing terms. 

 --- 

 ## Contact 

 - GitHub Profile: [Laadnanimoustapha](https://github.com/Laadnanimoustapha) 

 --- 

 **Note:**   
 This project is in active development. For bugs, feature requests, or questions, please open an issue or contact the repository owner directly. 

 ## Technologies Used 
 
 This project leverages the following programming languages and technologies: 
 
 - **HTML5:** <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5 logo">
 - **CSS3:** <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3 logo">
 - **JavaScript:** <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript logo">
