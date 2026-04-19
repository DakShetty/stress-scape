# StressScape: Viva Prep Guide
**Mastering the Technical Q&A**

---

### 1. What is the problem your application is solving?
**Answer**: StressScape addresses "Urban Environmental Fatigue." Citizens often lack a single, quantifiable metric to understand how air quality, temperature, and crowding combined affect their health. Our app provides a unified **Stress Score** (0-100) and an **AI Advisor** that translates complex sensor data into actionable human advice.

### 2. Why did you choose your specific technology stack?
**Answer**: We chose the **MERN Stack** (MongoDB, Express, React, Node) because it allows for an "End-to-End JavaScript" environment, which simplifies data handling between the frontend and backend. 
- **React**: Handles complex map interactions and state updates efficiently. 
- **MongoDB**: Ideal for urban data which can have varying structures (different cities have different sensor types).
- **Node.js**: Excellent for asynchronous I/O, allowing us to fetch data from three separate APIs (WAQI, TomTom, OpenWeather) without blocking the main thread.

### 3. Explain your system architecture.
**Answer**: The app follows a **Decoupled Architecture**. The React frontend communicates with an Express/Node.js REST API. The backend acts as an **Intelligence Orchestrator**—it doesn't just store data; it actively fetches live sensor metrics and queries the Gemini AI Model to provide real-time enrichment before sending data back to the client.

### 4. How does your backend communicate with the frontend?
**Answer**: Communication happens via **Asynchronous HTTP REST calls**. We use a centralized `apiClient` in the frontend that sends JWT (JSON Web Tokens) in the Authorization headers. Because the backend and frontend run on different ports (5100 and 5173), we configured a **Vite Proxy** to prevent CORS issues during development.

### 5. What challenges did you face during development?
**Answer**:
- **Port Conflict Management**: Windows system ports (5000/5001) were often locked by system processes. We solved this by implementing a custom port-shifting strategy to **Port 5100**.
- **Data Normalization**: Converting disparate units (AQI in index, Traffic in km/h, Temp in Celsius) into a singular Stress Score. We solved this by creating a **Weighted Normalization Engine** in the services layer.
- **Asynchronous Synchronization**: Running 40+ API calls sequentially without hitting rate limits.

### 6. How is your project scalable?
**Answer**: 
- **Horizontal Scaling**: The Stateless nature of our JWT authentication allows us to spin up multiple instances of the backend.
- **Database Scaling**: MongoDB’s document model allows us to add new environmental metrics (like Noise or Water Quality) without breaking existing schemas.
- **API Modularity**: New sensors can be added by simply creating a new "Enrichment Service" without modifying the core Map logic.

### 7. Explain your database schema design.
**Answer**: We use a **Relational-Object Hybrid** model:
- **Location Schema**: Stores fixed geo-coordinates and current environmental values.
- **User Schema**: Contains a "Referential Array" (`savedLocations`) that stores IDs of Location documents. This allows for efficient Many-to-Many relationships between users and urban spots.

### 8. What improvements would you make in future?
**Answer**:
- **WebSockets**: To implement a "Live Ticker" that updates the map in real-time without the user needing to refresh or wait for 30s intervals.
- **Historical Big Data**: Storing every sync in a Time-Series collection to let users see how stress has changed over months or years.

---

## 🚀 Bonus Questions (Examiner Favorites)

### 9. How did you integrate AI (Gemini) into the project?
**Answer**: We implemented a "Contextual Prompting" strategy. Instead of just sending a user's question to the AI, our backend first fetches the **current sensor data** of the selected location and injects it into the AI prompt. This makes the AI "Sensor-Aware."

### 10. What is Middleware? Where did you use it?
**Answer**: Middleware is a function that runs between the Request and the Response. We used it for:
1.  **Auth Middleware**: To verify JWT tokens and protect the "Admin Sync" and "Save Location" routes.
2.  **Error Handler**: To catch 404s and 500s globally and send clean JSON responses to the frontend.

### 11. How do you secure the API?
**Answer**: 
- **JWT**: For stateless authentication.
- **Bcrypt.js**: To hash passwords before they ever touch the database.
- **Environment Variables**: Using `.env` files to ensure sensitive API keys are never hardcoded or uploaded to version control.

### 12. What is the role of `CORS` in your app?
**Answer**: CORS (Cross-Origin Resource Sharing) is a security feature. We configured it in `server.js` using the `cors` package to explicitly allow only our frontend URL (`localhost:5173`) to make requests, preventing unauthorized external domains from accessing our API.
