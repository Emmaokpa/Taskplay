"use client";

// MUI Icon imports
import SearchIcon from '@mui/icons-material/Search';
// import TuneIcon from '@mui/icons-material/Tune'; // For Adjustments/Filter
// import ClearIcon from '@mui/icons-material/Clear'; // For XMark/Clear
 
const Header = () => {
  // Placeholder for user data and balance
  const userName = "Emmanuel"; // Replace with actual data
  const walletBalance = "0.00"; // Replace with actual data
  const userAvatar = "/avatar-placeholder.png"; // Replace with actual user avatar or placeholder

  return (
    <header className="flex items-center justify-between mb-8 px-0 py-4 md:px-2"> {/* Adjusted padding for integration */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Welcome, {userName}!</h1>
        <p className="text-sm text-gray-600">
          Let's complete some tasks today.
          {/* Optional: <a href="#" className="text-orange-500 font-semibold">Get Bonus</a> */}
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative flex items-center bg-white rounded-lg shadow-sm p-2 w-64 md:w-72">
          <SearchIcon className="text-gray-400 mr-2" sx={{ fontSize: 20 }} />
          <input
            type="text"
            placeholder="Search tasks..."
            className="flex-grow outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400"
          />
          {/* Optional clear/filter icons */}
          {/* <button className="text-gray-400 hover:text-gray-600 ml-2 p-1 rounded-full">
            <ClearIcon sx={{ fontSize: 16 }} />
          </button>
          <button className="text-gray-400 hover:text-gray-600 ml-1 p-1 rounded-full">
            <TuneIcon sx={{ fontSize: 20 }} />
          </button> */}
        </div>

        {/* Wallet Balance & User Avatar */}
        <div className="flex items-center text-gray-800 font-semibold">
          <span>₦{walletBalance}</span>
          <img src={userAvatar} alt="User Avatar" className="w-10 h-10 rounded-full ml-3 border-2 border-orange-500" />
        </div>
      </div>
    </header>
  );
};

export default Header;