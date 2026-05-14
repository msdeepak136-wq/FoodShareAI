import { useState } from 'react';
import Splash from './components/Splash';
import RoleSelection from './components/RoleSelection';
import Dashboard from './components/Dashboard';
import AddFood from './components/AddFood';
import NGOMatch from './components/NGOMatch';
import MapRoute from './components/MapRoute';
import Analytics from './components/Analytics';

const VIEWS = {
  SPLASH: 'splash',
  ROLE: 'role',
  DASHBOARD: 'dashboard',
  ADD_FOOD: 'add_food',
  NGO_MATCH: 'ngo_match',
  MAP_ROUTE: 'map_route',
  ANALYTICS: 'analytics',
};

export default function App() {
  const [view, setView] = useState(VIEWS.SPLASH);
  const [role, setRole] = useState(null);
  const [lastFood, setLastFood] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  const navigate = (to, data = {}) => {
    if (data.food) setLastFood(data.food);
    if (data.matchResult) setMatchResult(data.matchResult);
    if (data.role) setRole(data.role);
    setView(to);
  };

  const tabs = [
    { id: VIEWS.DASHBOARD, icon: '🏠', label: 'Home' },
    { id: VIEWS.ADD_FOOD, icon: '➕', label: 'Add' },
    { id: VIEWS.NGO_MATCH, icon: '🤝', label: 'Match' },
    { id: VIEWS.ANALYTICS, icon: '📊', label: 'Stats' },
  ];

  const showTabs = ![VIEWS.SPLASH, VIEWS.ROLE].includes(view);

  return (
    <div className="app-container">
      {/* Nav bar */}
      {showTabs && (
        <nav className="nav-bar">
          <span className="nav-logo">🌿 FoodNova</span>
          <span className="nav-role-badge">{role || 'farmer'}</span>
        </nav>
      )}

      {/* Page Content */}
      {view === VIEWS.SPLASH && (
        <Splash onContinue={() => navigate(VIEWS.ROLE)} />
      )}
      {view === VIEWS.ROLE && (
        <RoleSelection onSelect={(r) => navigate(VIEWS.DASHBOARD, { role: r })} />
      )}
      {view === VIEWS.DASHBOARD && (
        <Dashboard
          role={role}
          onAddFood={() => navigate(VIEWS.ADD_FOOD)}
          onMatchFood={(food) => navigate(VIEWS.NGO_MATCH, { food })}
          onStats={() => navigate(VIEWS.ANALYTICS)}
        />
      )}
      {view === VIEWS.ADD_FOOD && (
        <AddFood
          role={role}
          onFoodAdded={(food) => navigate(VIEWS.NGO_MATCH, { food })}
          onBack={() => navigate(VIEWS.DASHBOARD)}
        />
      )}
      {view === VIEWS.NGO_MATCH && (
        <NGOMatch
          food={lastFood}
          onRouteView={(result) => navigate(VIEWS.MAP_ROUTE, { matchResult: result })}
          onBack={() => navigate(VIEWS.DASHBOARD)}
        />
      )}
      {view === VIEWS.MAP_ROUTE && (
        <MapRoute
          matchResult={matchResult}
          onComplete={() => navigate(VIEWS.ANALYTICS)}
          onBack={() => navigate(VIEWS.NGO_MATCH)}
        />
      )}
      {view === VIEWS.ANALYTICS && (
        <Analytics onBack={() => navigate(VIEWS.DASHBOARD)} />
      )}

      {/* Bottom Tab Bar */}
      {showTabs && (
        <nav className="tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${view === tab.id ? 'active' : ''}`}
              onClick={() => navigate(tab.id)}
              id={`tab-${tab.id}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
