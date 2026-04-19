# Presentation: StressScape Urban Intelligence
**Real-Time Environmental Stress Mapping & AI Advisory**

---

### Slide 1: Title Slide
- **Project Name**: StressScape
- **Sub-tag**: AI-Powered Urban Resilience Mapping
- **Team**: [Names]
- **Focus**: MERN Stack | Live IoT Data | GenAI

---

### Slide 2: Problem Statement
- **The Invisible Crisis**: Modern urban stress is a combination of Air Pollution, Heat, and Overcrowding.
- **Fragmented Data**: Citizens use different apps for weather, AQI, and traffic.
- **Cognitive Load**: Hard for users to decide if an area is "safe" for specific activities (jogging, seniors, etc.).

---

### Slide 3: Motivation (The "Why")
- **SDG Alignment**: Aligning with UN Goal 11 (Sustainable Cities & Communities).
- **Health-First Approach**: Transforming raw sensor data into actionable health insights.
- **Empowerment**: Moving from passive monitoring to active AI-guided safety.

---

### Slide 4: System Architecture
- **Three-Tier Architecture**:
  - **Frontend**: React.js with Glassmorphism UI & Vite.
  - **Backend**: Node.js/Express Middleware with Port-Conflict Resolution logic.
  - **Data/AI**: MongoDB Atlas, Gemini LLM, and Triple-API sync (WAQI, TomTom, OpenWeather).
- *(Visual Advice: Use the Mermaid diagram from the Report here)*

---

### Slide 5: Key Features
- **42-Point Heatmap**: Visualizing stress scores across Maharashtra.
- **Admin Sync Engine**: Real-time aggregation from global sensor networks.
- **Personalized Advisor**: "Sensor-Aware" AI that reads live data to give safety tips.
- **Saved Favorites**: Personal gallery with live status cards for curated spots.

---

### Slide 6: Demo Screens (Gallery)
- **Map View**: Showing the Red/Yellow/Green stress markers.
- **Analytics View**: 24-hour health trend charts.
- **Smart Advisor**: Conversation showing Gemini AI analyzing PM2.5 levels.
- **Favorites Grid**: High-fidelity cards for saved locations.

---

### Slide 7: Technical Stack
- **Languages**: JavaScript (ES6+), HTML5, CSS3.
- **Libraries**:
  - **Frontend**: Recharts, TailwindCSS, React-Router.
  - **Backend**: Mongoose, JSON Web Tokens (JWT), Bcrypt.js, Express-Validator.
- **Infrastructure**: Git, NPM, Vite.

---

### Slide 8: Challenges & Learnings
- **Challenge 1**: Persistent Windows Port 5000/5001 conflicts.
  - *Solution*: Automated Port-Shifting to 5100 and Proxy-wiring.
- **Challenge 2**: Rate-limiting on free-tier APIs.
  - *Solution*: Synchronous request-batching with error fallbacks.
- **Challenge 3**: Calculating a "Virtual Stress Score" on-the-fly.
  - *Solution*: Developing a weighted normalization engine.

---

### Slide 9: Future Scope
- **Edge Computing**: Integrating actual hardware sensors (ESP32/Arduino).
- **Mobile Companion**: React Native App with PWA capabilities.
- **Community Stress Reporting**: Crowdsourcing street-level events.

---

### Slide 10: Conclusion
- StressScape is more than a map; it's a decision-support system for the modern city.
- Fulfills all MERN objectives while pushing the boundaries with Generative AI and Live Data.
- **Thank You! Any Questions?**
