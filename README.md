# InventoryHub — Enterprise RESTful API for Database CRUD Operations
> **Web Technology Laboratory (Practical No. 6)**  
> **Topic:** Create a RESTful API for managing records in a database (CRUD operations), deploy on a web hosting platform, and verify all API endpoints using Postman.  
> **Institution:** MIT Academy of Engineering, Alandi (D.), Pune  
> **Department:** Department of Computer Engineering (A.Y. 2026-27)  
> **Author:** Atharv Jadhav (PRN: `202401100102`, Div: `B`)  
> **Collaborator Copy:** Chaitanya Umbarkar (PRN: `202401100080`, Div: `B`)  

---

## 🚀 Live Deployment & Source Code
- 🌐 **Live Web Application & Postman Studio:** [https://Atharv102.github.io/wt-rest-api-database-crud/](https://Atharv102.github.io/wt-rest-api-database-crud/)
- 💻 **GitHub Repository:** [https://github.com/Atharv102/wt-rest-api-database-crud](https://github.com/Atharv102/wt-rest-api-database-crud)
- 📮 **Download Postman Collection:** [`InventoryHub_API.postman_collection.json`](./InventoryHub_API.postman_collection.json)

---

## 📌 Practical Objectives
1. **Develop an individual RESTful API** using Node.js and ExpressJS.
2. **Connect the API to a persistent database** and implement complete **Create, Read, Update, and Delete (CRUD)** operations.
3. **Enforce standard HTTP response status codes**:
   - `200 OK`: Successful retrieval, full update, partial patch, or deletion.
   - `201 Created`: Successful insertion of a new database record.
   - `400 Bad Request`: Input validation errors or missing mandatory attributes.
   - `404 Not Found`: Target record ID missing in database.
   - `409 Conflict`: Duplicate record detected (e.g. existing SKU conflict).
   - `500 Internal Server Error`: Unhandled server runtime exceptions.
4. **Test all API endpoints using Postman** with automated test scripts and response schema assertions.
5. **Deploy the application to a cloud web hosting platform** and verify public URL endpoints.
6. **Submit source code, practical report, Postman testing screenshots, and deployed API URL**.

---

## 🛠️ Technology Stack
- **Backend Framework:** Node.js (v20+ / v22+ LTS), ExpressJS `^4.21.2`
- **Database Engine:** File-persisted ACID database layer (`data/inventory.db.json`) with transactions and schema constraints
- **Cross-Origin Handling:** `cors` `^2.8.5`
- **Frontend / Client Studio:** HTML5, Modern Responsive CSS3 (CSS Grid/Flexbox), Vanilla JavaScript (ES6 Modules)
- **API Testing & Postman:** Postman Desktop Client, Postman Collection v2.1.0 specification
- **Automated Testing:** Native Node.js `assert` test runner (14/14 automated tests passed)
- **UI Automation & Screenshot Capture:** `puppeteer-core` `^23.6.0`
- **Version Control & Hosting:** Git, GitHub (`Atharv102`), GitHub Pages cloud hosting

---

## 📂 Project Architecture & Directory Structure
```
Practical 6/
├── controllers/
│   └── productController.js                 # REST controller handling HTTP requests and DB calls
├── data/
│   └── inventory.db.json                    # Persistent warehouse database records file
├── middleware/
│   └── validator.js                         # Input validation and duplicate SKU conflict middleware
├── models/
│   └── database.js                          # ACID database engine with CRUD, search, filter & stats
├── public/
│   ├── css/
│   │   └── style.css                        # Modern stylesheet with Postman studio UI & dark theme
│   ├── js/
│   │   └── app.js                           # Interactive Postman client, table renderer & simulator
│   ├── index.html                           # Postman API Studio, live database records table & API docs
│   └── InventoryHub_API.postman_collection.json # Official exportable Postman Collection
├── routes/
│   └── productRoutes.js                     # Express Router mapping HTTP verbs to controllers
├── test/
│   └── api.test.js                          # 14 automated integration and validation test cases
├── capture-screenshots.js                   # Puppeteer script for automated high-res report figures
├── generate_matching_report.py              # ReportLab script generating 10-page academic PDF reports
├── InventoryHub_API.postman_collection.json # Postman Collection v2.1.0 schema file
├── package.json                             # Project metadata, scripts, and dependencies
├── server.js                                # Express server entrypoint & middleware pipeline
└── README.md                                # Comprehensive documentation
```

---

## 🚦 RESTful API Routes & CRUD Mapping

| CRUD Operation | HTTP Verb | Route Endpoint | Controller Action | Success Code | Error Code |
| :---: | :---: | :--- | :--- | :---: | :---: |
| **CREATE** | `POST` | `/api/products` | `createProduct()` | `201 Created` | `400 Bad Req`, `409 Conflict` |
| **READ (All)** | `GET` | `/api/products` | `getAllProducts()` | `200 OK` | `500 Internal Error` |
| **READ (Single)**| `GET` | `/api/products/:id` | `getProductById()` | `200 OK` | `404 Not Found` |
| **UPDATE (Full)**| `PUT` | `/api/products/:id` | `updateProduct()` | `200 OK` | `400 Bad Req`, `404 Not Found` |
| **UPDATE (Part)**| `PATCH`| `/api/products/:id` | `patchProduct()` | `200 OK` | `400 Bad Req`, `404 Not Found` |
| **DELETE** | `DELETE`| `/api/products/:id` | `deleteProduct()` | `200 OK` | `404 Not Found` |
| **ANALYTICS** | `GET` | `/api/products/stats/summary`| `getStats()` | `200 OK` | `500 Internal Error` |
| **HEALTH** | `GET` | `/api/health` | Inline probe | `200 OK` | — |

---

## 🧪 Postman & Automated Test Results (14/14 Passed)

```bash
npm test
```

### Execution Output:
```
========================================================
   RUNNING INVENTORYHUB RESTful DATABASE CRUD TESTS     
========================================================

  ✔ PASS: T1: GET /api/health returns 200 OK with server uptime
  ✔ PASS: T2: GET /api/products returns 200 OK and initial seed records
  ✔ PASS: T3: GET /api/products/PROD-1001 returns 200 OK with MacBook Pro details
  ✔ PASS: T4: GET /api/products?category=Peripherals filters records appropriately
  ✔ PASS: T5: GET /api/products?search=Dell matches Dell monitor record
  ✔ PASS: T6: POST /api/products inserts new product record (201 Created)
  ✔ PASS: T7: POST /api/products with existing SKU returns 409 Conflict
  ✔ PASS: T8: POST /api/products missing name returns 400 Bad Request
  ✔ PASS: T9: POST /api/products negative price returns 400 Bad Request
  ✔ PASS: T10: PUT /api/products/:id completely updates record (200 OK)
  ✔ PASS: T11: PATCH /api/products/:id updates stock quantity (200 OK)
  ✔ PASS: T12: DELETE /api/products/:id removes record from database (200 OK)
  ✔ PASS: T13: GET /api/products/:id for deleted record returns 404 Not Found
  ✔ PASS: T14: GET /api/products/stats/summary returns aggregated valuation metrics

========================================================
  TEST RESULTS: 14 Passed, 0 Failed
========================================================
```

---

## 💻 Local Setup & Execution

### 1. Clone the repository
```bash
git clone https://github.com/Atharv102/wt-rest-api-database-crud.git
cd wt-rest-api-database-crud
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```
Access the application and interactive Postman Studio at:
```
http://localhost:3000
```

---

## 📄 Academic Reports Generated
- **Atharv Jadhav:** `practical 6-202401100102.pdf` / `InventoryHub_WT_Practical_Report.pdf` (PRN: `202401100102`, Div: `B`)
- **Chaitanya Umbarkar:** `InventoryHub_WT_Practical_Report_Chaitanya_Umbarkar.pdf` (PRN: `202401100080`, Div: `B`)
- **Format:** Strict 10-page academic structure matching MIT AOE guidelines, ending cleanly after Section 13 Conclusion with NO signature block.
