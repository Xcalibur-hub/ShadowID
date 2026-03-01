# 🛡️ ShadowID: Kinetic Identity Guardian
**Continuous, Passive Behavioral Biometrics for Mobile Security.**

ShadowID is an "Invisible AI" bodyguard that protects your phone from snatch-and-run theft. Unlike FaceID, which only checks you once, ShadowID monitors your unique hand tremors in the background.

## 🚀 The Innovation: Passive Observation
- **Low-Power Mode:** Operates at 2Hz in the background, consuming <1% battery.
- **Forensic Trigger:** High-intensity AI only "wakes up" during a snatch event or manual challenge.
- **Vision Agents:** Integrates the **Vision Agents SDK by Stream** to autonomously reason if a motion anomaly constitutes a security threat.

## 🛠️ Tech Stack
- **Mobile:** React Native (Expo SDK 54)
- **Backend:** Python FastAPI "Forensic Brain"
- **AI Engine:** Numpy Z-Score Anomaly Detection
- **Agentic Layer:** Stream Vision Agents SDK

## 📈 How it Works
1. **Calibrate:** The system learns your hand's natural "Noise Baseline."
2. **Observe:** The app silently buffers kinetic data.
3. **Challenge:** When the phone is jerked, the Z-Score spikes. The Vision Agent analyzes the context and initiates a **Lockdown**.
