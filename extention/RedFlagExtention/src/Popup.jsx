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
      
      setStatus("🔍 Starting Insight Analysis...");
      
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      );

      const responsePromise = new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "analyzeWebsite", url: link }, (response) => {
          resolve(response);
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

      if (response?.success && response.websiteData) {
        setWebsiteAnalysis(response.websiteData.data);
        setStatus("✅ Insight Analysis complete");
        // Reload user profile to update token count
        loadUserProfile();
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
    <div className="min-h-[500px] w-[380px] bg-black text-white font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 backdrop-blur-sm border-b border-red-500/30 p-4">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => chrome.tabs.create({ url: 'http://localhost:5173' })}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group"
            title="Open RedFlag Dashboard"
          >
            <FaShield className="text-red-500 text-2xl group-hover:scale-110 transition-transform" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
              RedFlag
            </h1>
          </div>
          <div className="relative">
            <div 
              onClick={() => setShowProfile(!showProfile)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
            >
              <FaUser className="text-white text-sm" />
            </div>
            
            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-12 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                {user ? (
                  <div className="p-4">
                    {/* User Info */}
                    <div className="mb-4 pb-4 border-b border-neutral-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
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
                    <div className="mb-4 pb-4 border-b border-neutral-800">
                      <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Current Plan</div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white capitalize text-sm">{user.plan}</span>
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                            {user.plan === 'free' ? 'Limited' : user.plan === 'enterprise' ? 'Unlimited' : 'Premium'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Token Usage */}
                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Scan Usage</div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Used</span>
                          <span className="text-sm font-semibold text-white">
                            {user.tokensUsed} / {user.tokenLimit === -1 ? '∞' : user.tokenLimit}
                          </span>
                        </div>
                        {user.tokenLimit !== -1 && (
                          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-red-700 transition-all duration-300 rounded-full"
                              style={{ width: `${Math.min((user.tokensUsed / user.tokenLimit) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FaRightFromBracket size={16} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
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
                      className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
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
        <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-sm border border-neutral-800 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                <FaShield className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Login to RedFlag</h2>
              <p className="text-xs text-gray-400">Access your account to use the extension</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full bg-black/30 border border-neutral-800 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full bg-black/30 border border-neutral-800 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
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
                  className="flex-1 bg-white hover:bg-neutral-200 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200"
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
        <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-200">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <FaSpinner className="text-red-500 animate-spin" size={20} />
            ) : aiResult || unsafeList.length > 0 || websiteAnalysis ? (
              <FaCircleCheck className="text-green-500" size={20} />
            ) : (
              <FaMagnifyingGlass className="text-gray-400" size={20} />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {status || "Ready to analyze"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button 
            onClick={handleCheck}
            disabled={isLoading}
            className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-600 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaShield size={16} />
            AI Analysis (Copied Link)
          </button>
          
          <button 
            onClick={handleCheck2}
            disabled={isLoading}
            className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-600 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaMagnifyingGlass size={16} />
            Deep Analysis (Copied Link)
          </button>
          
          <button 
            onClick={handleInsightAnalysis}
            disabled={isLoading}
            className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-600 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaChartLine size={16} />
            Insight Analysis (Copied Link)
          </button>
        </div>

        {/* AI Result */}
        {aiResult && (
          <div className="bg-neutral-900 rounded-xl p-4 border border-red-500 animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <FaShield className="text-red-500" size={16} />
              <h3 className="font-semibold text-sm">AI Analysis Result</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
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
                <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
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
          <div className="bg-neutral-900 rounded-xl p-4 border border-red-500 animate-fadeIn">
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
          <div className="bg-neutral-900 rounded-xl p-4 border border-green-500 animate-fadeIn">
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
          <div className="bg-neutral-900 rounded-xl p-4 border border-purple-500 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <FaChartLine className="text-purple-500" size={16} />
              <h3 className="font-semibold text-sm">Insight Analysis Results</h3>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{websiteAnalysis.total_links}</div>
                <div className="text-xs text-gray-400 mt-1">Links Found</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{websiteAnalysis.links_analyzed}</div>
                <div className="text-xs text-gray-400 mt-1">Analyzed</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {websiteAnalysis.results.filter(r => r.analysis.ai_result?.label === "malicious").length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Malicious</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {websiteAnalysis.results.filter(r => r.analysis.ai_result?.label === "benign").length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Benign</div>
              </div>
            </div>
            
            {/* Detailed Results */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Detailed Results</h4>
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