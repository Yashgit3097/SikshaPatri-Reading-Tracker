import React, { useEffect, useState } from "react";

const API = "http://localhost:5000";

// 🔄 Animated Spinner
const Spinner = () => (
  <div className="flex justify-center items-center py-6">
    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const [step, setStep] = useState("login");
  const [name, setName] = useState("");
  const [smk, setSMK] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // ✅ Auto-login from localStorage
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
      setStep(data.goal > 0 ? "tracker" : "goal");
    } catch (err) {
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
      setStep(data.goal > 0 ? "tracker" : "goal");
      localStorage.setItem("shikshapatri-user", JSON.stringify({ name, smk, password }));
    } catch (err) {
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
    setReadCount(newCount);
    await fetch(`${API}/update-count`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smk, password, count: newCount }),
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
    setUserData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-6 transition-all duration-300">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-purple-700 animate-fade-in">
          📖 Shikshapatri Reading Tracker
        </h1>

        {/* Global Loading */}
        {loading && <Spinner />}

        {/* Step 1: Login */}
        {!loading && step === "login" && (
          <>
            <input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 mb-3 rounded"
            />
            <input
              placeholder="SMK (if available)"
              value={smk}
              onChange={(e) => setSMK(e.target.value)}
              className="w-full border p-2 mb-3 rounded"
            />
            <input
              placeholder="Password (if no SMK)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            />
            <button
              onClick={login}
              disabled={btnLoading}
              className={`w-full bg-purple-600 text-white py-2 rounded transition-all ${btnLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-purple-700"
                }`}
            >
              {btnLoading ? "Loading..." : "Continue"}
            </button>
          </>
        )}

        {/* Step 2: Goal Setup */}
        {step === "goal" && !loading && (
          <>
            <p className="mb-2 text-gray-700 text-center font-medium">
              🙏 Set your reading goal (How many times do you want to read?)
            </p>
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
            />
            <button
              onClick={saveGoal}
              disabled={btnLoading}
              className={`w-full bg-blue-600 text-white py-2 rounded transition-all ${btnLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
            >
              {btnLoading ? "Saving..." : "Set Goal"}
            </button>
          </>
        )}

        {/* Step 3: Tracker */}
        {step === "tracker" && !loading && (
          <>
            <div className="mb-4 text-sm sm:text-base">
              <p className="mb-1">👤 <strong>Name:</strong> {userData?.name}</p>
              <p className="mb-1">🎯 <strong>Goal:</strong> {goal}</p>
              <p className="mb-1">✅ <strong>Read Count:</strong> {readCount}</p>
              <p className="mb-4">⏳ <strong>Remaining:</strong> {Math.max(goal - readCount, 0)}</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={() => updateCount(readCount + 1)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
              >
                +1
              </button>
              <button
                onClick={() => updateCount(Math.max(readCount - 1, 0))}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
              >
                Undo
              </button>
              <input
                type="number"
                value={readCount}
                onChange={(e) => updateCount(parseInt(e.target.value))}
                className="w-24 border rounded p-1 text-center"
              />
              <button
                onClick={logout}
                className="ml-auto bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded"
              >
                Logout
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="w-full h-[65vh] md:h-[75vh] border rounded overflow-hidden animate-fade-in">
              <iframe
                src="/shikshapatri.pdf"
                title="Shikshapatri PDF"
                className="w-full h-full"
              ></iframe>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
