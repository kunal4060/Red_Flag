/* global chrome */
import { useState, useEffect } from "react";
import { 
  FaUser,
  FaShield, 
  FaMagnifyingGlass, 
  FaChartLine,
  FaCircleCheck,
  FaCircleXmark,
  FaSpinner,
  FaRightFromBracket,
  FaRightToBracket
} from "react-icons/fa6";

function Popup() {
  const [status, setStatus] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [unsafeList, setUnsafeList] = useState([]);
  const [safeList, setSafeList] = useState([]);
  const [websiteAnalysis, setWebsiteAnalysis] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="relative w-16 h-16">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
      
      {/* Middle rotating ring */}
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin"></div>
      
      {/* Inner pulsing circle */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse"></div>
      
      {/* Orbiting dots */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5">
          <div className="w-full h-full rounded-full bg-blue-400 shadow-lg shadow-blue-400/50 animate-orbit"></div>
        </div>
      </div>
      
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1">
          <div className="w-full h-full rounded-full bg-pink-400 shadow-lg shadow-pink-400/50 animate-orbit-reverse"></div>
        </div>
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ripple"></div>
      <div className="absolute inset-0 rounded-full border-2 border-pink-400/30 animate-ripple" style={{animationDelay: '0.5s'}}></div>
    </div>
  );

  // Scanning animation component
  const ScanningAnimation = () => (
    <div className="relative w-20 h-20">
      {/* Shield outline */}
      <div className="absolute inset-0 flex items-center justify-center">
        <FaShield className="text-purple-500/30 text-6xl" />
      </div>
      
      {/* Scanning line */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-70 animate-scan shadow-lg shadow-purple-400/50"></div>
      </div>
      
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-float">
          <FaMagnifyingGlass className="text-purple-400 text-xl drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
        </div>
      </div>
      
      {/* Corner particles */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{animationDelay: '0.3s'}}></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{animationDelay: '0.6s'}}></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{animationDelay: '0.9s'}}></div>
    </div>
  );

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      chrome.runtime.sendMessage({ action: "getProfile" }, (response) => {
        if (response?.success && response.profile) {
          setUser(response.profile);
        } else {
          setUser(null);
        }
      });
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    if (!loginForm.email || !loginForm.password) {
      setLoginError("Please fill in all fields");
      return;
    }

    chrome.runtime.sendMessage(
      { action: "login", email: loginForm.email, password: loginForm.password },
      (response) => {
        if (response?.success) {
          setUser(response.user);
          setShowLogin(false);
          setLoginForm({ email: "", password: "" });
        } else {
          setLoginError(response?.error || "Login failed");
        }
      }
    );
  };

  const handleLogout = () => {
    chrome.runtime.sendMessage({ action: "logout" }, () => {
      setUser(null);
      setShowProfile(false);
    });
  };

  const handleCheck = async () => {
  setStatus("🔍 Reading clipboard...");
  setAiResult(null);
  setUnsafeList([]);
  setSafeList([]);
  setWebsiteAnalysis(null);
  try {
    const link = await navigator.clipboard.readText();
    if (!link) {
      setStatus("Clipboard is empty");
      return;
    }

    setStatus("🔍 Running AI analysis...");

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 10000)
    );

    const responsePromise = new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "analyzeLinkAI", link }, (response) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(response);
      });
    });

    const response = await Promise.race([responsePromise, timeout]);

    if (response?.requiresAuth) {
      setStatus("❌ Please log in to use this feature");
      setShowLogin(true);
      return;
    }

    if (response?.tokenLimitExceeded) {
      setStatus("❌ " + (response?.error || "Token limit exceeded"));
      return;
    }

    if (response?.success && response.ai) {
      const ai = response.ai?.ai_result || response.ai;
      setAiResult(ai);
      setStatus("✅ AI analysis complete");
      // Reload user profile to update token count
      loadUserProfile();
    } else {
      setStatus("❌ AI analysis failed: " + (response?.error || "unknown error"));
    }
  } catch (err) {
    console.error("Error in handleCheck:", err);
    setStatus("❌ Error: " + err.message);
  }
};


  const handleCheck2 = async () => {
  setStatus("🔍 Reading clipboard for VirusTotal scan...");
  setAiResult(null);
  setUnsafeList([]);
  setSafeList([]);
  setWebsiteAnalysis(null);
  try {
    const link = await navigator.clipboard.readText();
    if (!link) {
      setStatus("Clipboard is empty");
      return;
    }

    setStatus("🔍 Running VirusTotal scan...");

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 15000)
    );

    const responsePromise = new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: "analyzeLinkVT", link }, (response) => {
        resolve(response);
      });
    });

    const response = await Promise.race([responsePromise, timeout]);

    if (response?.success) {
      if (response.unsafeSources) setUnsafeList(response.unsafeSources);
      if (response.safeSources) setSafeList(response.safeSources);
      setStatus("✅ VirusTotal scan complete");
    } else {
      setStatus("❌ VirusTotal scan failed: " + (response?.error || "unknown error"));
    }
  } catch (err) {
    console.error("Error in handleCheck2:", err);
    setStatus("❌ Error: " + err.message);
  }
};

  const handleInsightAnalysis = async () => {
    setStatus("🔍 Reading clipboard for Insight Analysis...");
    setAiResult(null);
    setUnsafeList([]);
    setSafeList([]);
    setWebsiteAnalysis(null);
    
    try {
      const link = await navigator.clipboard.readText();
      if (!link) {
        setStatus("Clipboard is empty");
        return;
      }
      
      console.log('🔍 Starting Insight Analysis for:', link);
      setStatus("🔍 Starting Insight Analysis...");
      
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      );

      const responsePromise = new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "analyzeWebsiteForInterceptor", url: link }, (response) => {
          resolve(response);
        });
      });

      const response = await Promise.race([responsePromise, timeout]);

      if (response?.success && response.websiteData) {
        console.log('✅ Insight Analysis response:', response.websiteData);
        setWebsiteAnalysis(response.websiteData);
        setStatus("✅ Insight Analysis complete");
      } else {
        setStatus("❌ Insight Analysis failed: " + (response?.error || "unknown error"));
      }
    } catch (err) {
      console.error("Error in handleInsightAnalysis:", err);
      setStatus("❌ Error: " + err.message);
    }
  };

  const isLoading = status.includes("🔍");

  return (
    <div className="min-h-[500px] w-[380px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-blue-900/40 backdrop-blur-xl border-b border-purple-500/30 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => chrome.tabs.create({ url: 'http://localhost:5173' })}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group"
            title="Open RedFlag Dashboard"
          >
            <FaShield className="text-purple-400 text-2xl group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              RedFlag
            </h1>
          </div>
          <div className="relative">
            <div 
              onClick={() => setShowProfile(!showProfile)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg hover:shadow-purple-500/50 animate-glow"
            >
              <FaUser className="text-white text-sm" />
            </div>
            
            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-12 w-72 bg-gradient-to-br from-slate-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                {user ? (
                  <div className="p-4">
                    {/* User Info */}
                    <div className="mb-4 pb-4 border-b border-purple-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <span className="text-white font-bold text-lg">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Plan Info */}
                    <div className="mb-4 pb-4 border-b border-purple-500/20">
                      <div className="text-xs text-purple-300 mb-2 uppercase tracking-wide">Current Plan</div>
                      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-3 border border-purple-500/10">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white capitalize text-sm">{user.plan}</span>
                          <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-full border border-purple-500/30">
                            {user.plan === 'free' ? 'Limited' : user.plan === 'enterprise' ? 'Unlimited' : 'Premium'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Token Usage */}
                    <div className="mb-4">
                      <div className="text-xs text-purple-300 mb-2 uppercase tracking-wide">Scan Usage</div>
                      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-3 border border-purple-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Used</span>
                          <span className="text-sm font-semibold text-white">
                            {user.tokensUsed} / {user.tokenLimit === -1 ? '∞' : user.tokenLimit}
                          </span>
                        </div>
                        {user.tokenLimit !== -1 && (
                          <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-300 rounded-full shadow-lg shadow-purple-500/50"
                              style={{ width: `${Math.min((user.tokensUsed / user.tokenLimit) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
                    >
                      <FaRightFromBracket size={16} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-glow">
                        <FaUser className="text-white text-2xl" />
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">Not Logged In</p>
                      <p className="text-xs text-gray-400">Log in to start using the extension</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        setShowLogin(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
                    >
                      <FaRightToBracket size={16} />
                      Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">AI-Powered Security Analysis</p>
      </div>

      {/* Login Modal */}
      {showLogin && !user && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-slate-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-xl rounded-xl p-6 w-full max-w-sm border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-glow">
                <FaShield className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Login to RedFlag</h2>
              <p className="text-xs text-gray-400">Access your account to use the extension</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-purple-300 mb-2 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-purple-500/30 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-xs text-purple-300 mb-2 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full bg-slate-900/50 border border-purple-500/30 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>
              
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                  <FaCircleXmark size={14} />
                  {loginError}
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setLoginError("");
                    setLoginForm({ email: "", password: "" });
                  }}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-3">
        {/* Status Card */}
        <div className="bg-gradient-to-br from-slate-800/50 via-purple-900/20 to-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 shadow-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <ScanningAnimation />
              <p className="text-sm font-medium mt-4 text-purple-300 animate-pulse">
                {status || "Analyzing..."}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {aiResult || unsafeList.length > 0 || websiteAnalysis ? (
                <FaCircleCheck className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" size={20} />
              ) : (
                <FaMagnifyingGlass className="text-purple-300" size={20} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {status || "Ready to analyze"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button 
            onClick={handleCheck}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50 disabled:shadow-none"
          >
            <FaShield size={16} />
            AI Analysis (Copied Link)
          </button>
          
          {/* <button 
            onClick={handleCheck2}
            disabled={isLoading}
            className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-600 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaMagnifyingGlass size={16} />
            Deep Analysis (Copied Link)
          </button> */}
          
          <button 
            onClick={handleInsightAnalysis}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-pink-500/50 disabled:shadow-none"
          >
            <FaChartLine size={16} />
            Insight Analysis (Copied Link)
          </button>
        </div>

        {/* AI Result */}
        {aiResult && (
          <div className="bg-gradient-to-br from-slate-800/70 via-purple-900/30 to-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-purple-500/40 animate-fadeIn shadow-lg shadow-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <FaShield className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" size={16} />
              <h3 className="font-semibold text-sm">AI Analysis Result</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
                <span className="text-gray-400 text-sm">Classification:</span>
                <span className={`font-semibold text-sm px-3 py-1 rounded-full ${
                  (aiResult.label ?? aiResult) === "malicious" 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}>
                  {aiResult.label ?? aiResult}
                </span>
              </div>
              {typeof aiResult.score === "number" && (
                <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20">
                  <span className="text-gray-400 text-sm">Confidence:</span>
                  <span className="font-semibold text-sm">
                    {(aiResult.score * 100).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unsafe Sources */}
        {unsafeList.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/70 via-red-900/30 to-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-red-500/40 animate-fadeIn shadow-lg shadow-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <FaCircleXmark className="text-red-500" size={16} />
              <h3 className="font-semibold text-sm">Flagged Engines ({unsafeList.length})</h3>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
              {unsafeList.map((s, idx) => (
                <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="font-medium text-sm text-red-400">{s.engine_name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {s.category} {s.result ? `• ${s.result}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safe Sources */}
        {safeList.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/70 via-green-900/30 to-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-green-500/40 animate-fadeIn shadow-lg shadow-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <FaCircleCheck className="text-green-500" size={16} />
              <h3 className="font-semibold text-sm">Safe Engines ({safeList.length})</h3>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
              {safeList.map((s, idx) => (
                <div key={idx} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="font-medium text-sm text-green-400">{s.engine_name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {s.category} {s.result ? `• ${s.result}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      
        {/* Website Analysis */}
        {websiteAnalysis && (
          <div className="bg-gradient-to-br from-slate-800/70 via-purple-900/40 to-slate-800/70 backdrop-blur-sm rounded-xl p-4 border border-purple-500/40 shadow-xl shadow-purple-500/20 animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <FaChartLine className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" size={16} />
              <h3 className="font-semibold text-sm">Insight Analysis Results</h3>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-lg p-3 text-center border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">{websiteAnalysis.total_links}</div>
                <div className="text-xs text-gray-400 mt-1">Links Found</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm rounded-lg p-3 text-center border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-400">{websiteAnalysis.links_analyzed}</div>
                <div className="text-xs text-gray-400 mt-1">Analyzed</div>
              </div>
              <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 backdrop-blur-sm rounded-lg p-3 text-center border border-red-500/20">
                <div className="text-2xl font-bold text-red-400">
                  {websiteAnalysis.results.filter(r => r.analysis.ai_result?.label === "malicious").length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Malicious</div>
              </div>
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm rounded-lg p-3 text-center border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">
                  {websiteAnalysis.results.filter(r => r.analysis.ai_result?.label === "benign").length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Benign</div>
              </div>
            </div>
            
            {/* Detailed Results */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wide">Detailed Results</h4>
              <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                {websiteAnalysis.results.map((result, idx) => {
                  const isMalicious = result.analysis.ai_result?.label === "malicious";
                  return (
                    <div key={idx} className={`rounded-lg p-3 border ${
                      isMalicious 
                        ? "bg-red-500/10 border-red-500/20" 
                        : "bg-green-500/10 border-green-500/20"
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          isMalicious 
                            ? "bg-red-500/20 text-red-400" 
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {result.analysis.ai_result?.label || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {((result.analysis.ai_result?.score || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 break-all">{result.url}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Popup;
// ...existing code...