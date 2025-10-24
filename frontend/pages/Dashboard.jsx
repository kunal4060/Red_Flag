import React, { useState, useEffect } from 'react';
import { axiosInstance as axios } from '../lib/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/useAuthStore';

// Main Dashboard component
const Dashboard = () => {
  // Access authenticated user from global state
  const { authUser } = useAuthStore();
  
  // State variables for component data
  const [usageStats, setUsageStats] = useState(null); // Extension usage statistics
  const [loading, setLoading] = useState(true);      // Loading state for API calls
  const [error, setError] = useState(null);          // Error state for API calls
  const [applicantName, setApplicantName] = useState(null);   // Name from application form
  const [applicantPlan, setApplicantPlan] = useState(null);   // Plan from application form

  // useEffect hook to fetch data when component mounts or authUser changes
  useEffect(() => {
    // Function to retrieve applicant data from localStorage or sessionStorage
    const getApplicantData = () => {
      try {
        // Try localStorage first for persistent data
        let name = localStorage.getItem('applicantName');
        let plan = localStorage.getItem('applicantPlan');
        
        // If not found in localStorage, try sessionStorage (session-only data)
        if (!name) {
          name = sessionStorage.getItem('applicantName');
        }
        if (!plan) {
          plan = sessionStorage.getItem('applicantPlan');
        }
        
        // Validate and set state only if data exists and is valid
        if (name && name !== 'null' && name !== 'undefined' && name.trim() !== '') {
          setApplicantName(name.trim());
        }
        
        if (plan && plan !== 'null' && plan !== 'undefined' && plan.trim() !== '') {
          setApplicantPlan(plan.trim());
        }
        
        console.log('Retrieved applicant data - Name:', name, 'Plan:', plan);
      } catch (error) {
        console.error('Error retrieving applicant data:', error);
      }
    };
    
    // Call the function to get applicant data
    getApplicantData();
    
    // Only fetch usage stats if user is authenticated
    if (authUser) {
      // Async function to fetch usage statistics from backend API
      const fetchUsageStats = async () => {
        try {
          setLoading(true); // Set loading state to true while fetching
          const response = await axios.get('/usage/stats'); // API call to get usage stats
          setUsageStats(response.data); // Set the received data in state
        } catch (err) {
          setError('Failed to fetch usage statistics'); // Set error state if API call fails
          console.error('Error fetching usage stats:', err);
        } finally {
          setLoading(false); // Always set loading to false when done
        }
      };
      
      // Call the fetch function
      fetchUsageStats();
    } else {
      // If not authenticated, stop loading immediately
      setLoading(false);
    }
  }, [authUser]); // Re-run effect when authUser changes

  // Show loading screen while fetching data
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
        <Header />
        <div className="flex flex-col items-center justify-center flex-grow text-white py-20">
          <div className="text-2xl">Loading dashboard...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Redirect to apply page if user is not authenticated and no applicant name is found
  if (!authUser && !applicantName) {
    window.location.href = '/apply';
    return null;
  }

  // Get user name (from authenticated user if available, otherwise from application data)
  const userName = authUser?.firstName || applicantName || 'User';
  
  // Get plan information (from authenticated user if available, otherwise from application data)
  const userPlan = authUser?.plan || applicantPlan || 'free';
  
  // Define plan details for display
  const planDetails = {
    free: { name: 'Free', limit: 10, price: '$0', description: 'Basic Protection' },
    basic: { name: 'Basic', limit: 50, price: '$8', description: 'Enhanced Security' },
    premium: { name: 'Premium', limit: 'Unlimited', price: '$16', description: 'Premium Protection' }
  };
  
  // Get current plan details or default to free plan
  const currentPlan = planDetails[userPlan] || planDetails.free;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-950">
      <Header />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section - Welcome message and page title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-red-500 mb-2">Welcome back, {userName}!</h1>
            <p className="text-2xl font-bold text-white">Extension Usage Statistics</p>
          </div>

          {/* Statistics Section - First Row with 4 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Analysis Card - Shows total number of URL analyses performed */}
            <div className="bg-gray-800 rounded-lg p-6 border border-red-900/50 shadow-lg hover:shadow-red-900/30 transition-shadow">
              <h3 className="text-lg font-bold text-white mb-2">Total Analysis</h3>
              <p className="text-3xl font-bold text-white mb-2">
                {usageStats ? usageStats.totalUsage : 0}
              </p>
              {/* Progress bar showing usage relative to plan limit */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ 
                    width: `${usageStats && usageStats.limit ? Math.min(100, (usageStats.totalUsage / usageStats.limit) * 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Current Plan Card - Shows user's current subscription plan */}
            <div className="bg-gray-800 rounded-lg p-6 border border-red-900/50 shadow-lg hover:shadow-red-900/30 transition-shadow">
              <h3 className="text-lg font-bold text-white mb-2">Current Plan</h3>
              <p className="text-3xl font-bold text-white mb-2 capitalize">{currentPlan.name}</p>
              {/* Badge showing plan description */}
              <span className="inline-block bg-red-900 text-red-100 text-xs font-semibold px-2 py-1 rounded">
                {currentPlan.description}
              </span>
            </div>

            {/* Today's Usage Card - Shows usage for current day vs daily limit */}
            <div className="bg-gray-800 rounded-lg p-6 border border-red-900/50 shadow-lg hover:shadow-red-900/30 transition-shadow">
              <h3 className="text-lg font-bold text-white mb-2">Today's Usage</h3>
              <p className="text-3xl font-bold text-white mb-2">
                {usageStats ? `${usageStats.todaysUsage || 0}/${usageStats.limit || 10}` : '0/10'}
              </p>
              {/* Blue progress bar showing daily usage */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${usageStats && usageStats.limit ? Math.min(100, ((usageStats.todaysUsage || 0) / usageStats.limit) * 100) : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Lifetime Usage Card - Shows total usage over time */}
            <div className="bg-gray-800 rounded-lg p-6 border border-red-900/50 shadow-lg hover:shadow-red-900/30 transition-shadow">
              <h3 className="text-lg font-bold text-white mb-2">Lifetime Usage</h3>
              <p className="text-3xl font-bold text-white mb-2">
                {usageStats ? usageStats.userTotalUsage || 0 : 0}
              </p>
              {/* Green badge showing user progress status */}
              <span className="inline-block bg-green-900 text-green-100 text-xs font-semibold px-2 py-1 rounded">
                Getting Started
              </span>
            </div>
          </div>

          {/* Statistics Section - Second Row with 2 wide cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Usage by Action Card - Shows breakdown of different types of usage */}
            <div className="bg-gray-800 rounded-lg p-6 border border-red-900/50 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Usage by Action</h3>
              {usageStats && usageStats.usageByAction && usageStats.usageByAction.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {usageStats.usageByAction.map((item, index) => (
                    <div key={index} className="bg-gray-900/50 p-4 rounded-lg text-center">
                      <h4 className="text-lg font-bold text-white capitalize">
                        {item.id.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-2xl font-bold text-red-400">{item.count}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No usage data available</p>
              )}
            </div>

            {/* Recent Activity Card - Shows latest user activities */}
            <div className="bg-gray-800 rounded-lg p-6 border border-red-900/50 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              {usageStats && usageStats.recentUsage && usageStats.recentUsage.length > 0 ? (
                <div className="space-y-3">
                  {usageStats.recentUsage.slice(0, 5).map((item, index) => (
                    <div key={index} className="bg-gray-900/50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white capitalize">
                          {item.action.replace(/_/g, ' ')}
                        </h4>
                        {item.url && (
                          <p className="text-gray-400 text-sm truncate max-w-xs">
                            {item.url}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300 text-xs">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No recent activity</p>
              )}
            </div>
          </div>

          {/* Bottom Section - Daily Usage Progress with detailed progress bar */}
          <div className="bg-gray-800 rounded-lg p-6 border border-red-900/50 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Daily Usage Progress</h3>
            <p className="text-gray-300 mb-4">Daily Usage</p>
            {/* Main progress bar showing daily usage */}
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className="bg-red-600 h-4 rounded-full" 
                style={{ 
                  width: `${usageStats && usageStats.limit ? Math.min(100, ((usageStats.todaysUsage || 0) / usageStats.limit) * 100) : 0}%` 
                }}
              ></div>
            </div>
            {/* Progress bar labels showing min/current/max values */}
            <div className="flex justify-between text-gray-400 mt-2">
              <span>0</span>
              <span>{usageStats ? `${usageStats.todaysUsage || 0} of ${usageStats.limit || 10}` : '0 of 10'}</span>
              <span>{usageStats && usageStats.limit ? usageStats.limit : 10}</span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;