export default function MentorSidebar({
    user,
    tabs,
    activeTab,
    onTabChange,
    onLogout
}) {
    return (
        <div className="h-full flex flex-col">

            {/* App name */}
            <div className="p-4 border-b border-gray-800">
                <h1 className="text-blue-500 text-xl font-bold">ChatApp</h1>
                <p className="text-gray-500 text-xs mt-1">Mentor Dashboard</p>
            </div>

            {/* Tabs */}
            <nav className="flex-1 p-3 space-y-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex flex-col ${
                            activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                        }`}
                    >
                        <span className="font-medium">{tab.label}</span>
                        <span className={`text-xs ${
                            activeTab === tab.id ? 'text-blue-200' : 'text-gray-600'
                        }`}>
                            {tab.desc}
                        </span>
                    </button>
                ))}
            </nav>

            {/* User info */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{user?.name}</p>
                            <p className="text-blue-400 text-xs">Mentor</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="text-gray-500 hover:text-red-400 text-xs transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

        </div>
    );
}