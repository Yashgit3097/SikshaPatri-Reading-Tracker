import React, { useEffect, useState, useRef } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const API = "https://sikshapatri-reading-tracker.onrender.com";

const Spinner = () => (
  <div className="flex justify-center items-center py-6">
    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const viewerRef = useRef(null);
  const [step, setStep] = useState("login");
  const [name, setName] = useState("");
  const [smk, setSMK] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [lastPageRead, setLastPageRead] = useState(1);
  const [tempLastPage, setTempLastPage] = useState("1");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("shikshapatri-user"));
    if (saved && (saved.smk || saved.password)) {
      autoLogin(saved);
    }
  }, []);

  const autoLogin = async ({ name, smk, password }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, smk, password }),
      });
      const data = await res.json();
      setUserData(data);
      setName(data.name);
      setSMK(data.smk || "");
      setPassword(data.password || "");
      setReadCount(data.readCount || 0);
      setGoal(data.goal || 0);
      setLastPageRead(data.lastPageRead || 1);
      setTempLastPage(String(data.lastPageRead || 1));
      setStep(data.goal > 0 ? "tracker" : "goal");
    } catch {
      alert("Auto login failed.");
    }
    setLoading(false);
  };

  const login = async () => {
    setBtnLoading(true);
    try {
      const res = await fetch(`${API}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, smk, password }),
      });
      const data = await res.json();
      setUserData(data);
      setReadCount(data.readCount || 0);
      setGoal(data.goal || 0);
      setLastPageRead(data.lastPageRead || 1);
      setTempLastPage(String(data.lastPageRead || 1));
      setStep(data.goal > 0 ? "tracker" : "goal");
      localStorage.setItem("shikshapatri-user", JSON.stringify({ name, smk, password }));
    } catch {
      alert("Login failed.");
    }
    setBtnLoading(false);
  };

  const saveGoal = async () => {
    setBtnLoading(true);
    const res = await fetch(`${API}/set-goal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smk, password, goal: parseInt(goal) }),
    });
    const data = await res.json();
    setUserData(data);
    setStep("tracker");
    setBtnLoading(false);
  };

  const updateCount = async (newCount) => {
    if (newCount < 0) return;
    setReadCount(newCount);
    await fetch(`${API}/update-count`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smk, password, count: newCount }),
    });
  };

  const updateLastPage = async (page) => {
    if (isNaN(page) || page < 1) return;
    setLastPageRead(page);
    setTempLastPage(String(page));
    await fetch(`${API}/update-last-page`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smk, password, lastPageRead: page }),
    });
  };

  const logout = () => {
    localStorage.removeItem("shikshapatri-user");
    setStep("login");
    setName("");
    setSMK("");
    setPassword("");
    setGoal(0);
    setReadCount(0);
    setLastPageRead(1);
    setTempLastPage("1");
    setUserData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-4 sm:p-6 transition-all duration-300">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-purple-700 animate-fade-in">
          📖 શિક્ષાપત્રી વાંચન ટ્રેકર
        </h1>

        {loading && <Spinner />}

        {!loading && step === "login" && (
          <>
            <input placeholder="તમારું નામ" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 mb-3 rounded" />
            <input placeholder="SMK (જો ઉપલબ્ધ હોય તો)" value={smk} onChange={(e) => setSMK(e.target.value)} className="w-full border p-2 mb-3 rounded" />
            <input placeholder="પાસવર્ડ (જો SMK ન હોય તો)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mb-4 rounded" />
            <button onClick={login} disabled={btnLoading} className={`w-full bg-purple-600 text-white py-2 rounded transition-all ${btnLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-purple-700"}`}>
              {btnLoading ? "Loading..." : "Continue"}
            </button>
          </>
        )}

        {step === "goal" && !loading && (
          <>
            <p className="mb-2 text-gray-700 text-center font-medium">🙏તમારા વાંચન પાઠની સંખ્યા નક્કી કરો</p>
            <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full border p-2 mb-4 rounded" />
            <button onClick={saveGoal} disabled={btnLoading} className={`w-full bg-blue-600 text-white py-2 rounded transition-all ${btnLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"}`}>
              {btnLoading ? "Saving..." : "Set Goal"}
            </button>
          </>
        )}

        {step === "tracker" && !loading && (
          <>
            <div className="mb-4 text-sm sm:text-base">
              <p className="mb-1">👤 <strong>નામ:</strong> {userData?.name}</p>
              <p className="mb-1">🎯 <strong>કુલ વાંચન પાઠ (લક્ષ્ય):</strong> {goal}</p>

              <div className="mb-1 flex items-center gap-2">
                <label className="font-semibold">✅ વાચેલા પાઠ:</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-24"
                  value={readCount}
                  onChange={(e) => updateCount(Number(e.target.value))}
                />
              </div>

              <div className="mb-1 flex items-center gap-2">
                <label className="font-semibold">📄 છેલા વાંચેલુ પેજ:</label>
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-24"
                  value={tempLastPage}
                  onChange={(e) => setTempLastPage(e.target.value)}
                  onBlur={() => {
                    const num = parseInt(tempLastPage);
                    if (!isNaN(num) && num >= 1) updateLastPage(num);
                    else setTempLastPage(String(lastPageRead));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const num = parseInt(tempLastPage);
                      if (!isNaN(num) && num >= 1) updateLastPage(num);
                      else setTempLastPage(String(lastPageRead));
                    }
                  }}
                />
              </div>

              <p className="mb-4">⏳ <strong>બાકી રહેલા પાઠ ની સંખ્યા:</strong> {Math.max(goal - readCount, 0)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button onClick={() => updateCount(readCount + 1)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded">+1</button>
              <button onClick={() => updateCount(Math.max(readCount - 1, 0))} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded">Undo</button>
              <button onClick={logout} className="ml-auto bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded">Logout</button>
            </div>

            <div className="w-full flex flex-col items-center">
              <div className="border shadow rounded w-full h-[70vh] sm:h-[75vh] max-w-full overflow-hidden">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                  <Viewer fileUrl="/shikshapatri.pdf" initialPage={lastPageRead + 5} />
                </Worker>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
