import { Home, User, Calendar, Clock, Menu as MenuIcon, ShoppingCart, Package, Gift, MapPin, History, MessageSquare, Settings, Bell, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Module, User as UserType } from '@/client/app/App';
import { useNotifications } from '@/client/context/NotificationsContext';
import { useSystemConfig } from '@/client/context/SystemConfigContext';

interface TopDashboardProps {
  activeModule: Module;
  isLoggedIn: boolean;
  cartItemCount: number;
  onModuleChange: (module: Module) => void;
  onLogout: () => void;
  user: UserType | null;
  showModuleNav?: boolean; // New prop to control module nav visibility
}

interface NavItem {
  id: Module;
  label: string;
  icon: React.ReactNode;
}

export default function TopDashboard({
  activeModule,
  isLoggedIn,
  cartItemCount,
  onModuleChange,
  onLogout,
  user,
  showModuleNav = true // Default to true
}: TopDashboardProps) {
  const navigate = useNavigate();
  const { getUnreadCount } = useNotifications();
  const unreadCount = getUnreadCount();
  const { config: sysConfig } = useSystemConfig();

  const restaurantName = sysConfig.restaurantName
    ? sysConfig.restaurantName.toUpperCase()
    : 'RESTAURANT MANAGEMENT SYSTEM';

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    // Profile, Cart, Settings removed from module navigation - accessible only via header icons
    { id: 'reservation', label: 'Reservation', icon: <Calendar className="w-4 h-4" /> },
    { id: 'queue', label: 'Queue', icon: <Clock className="w-4 h-4" /> },
    { id: 'menu', label: 'Menu', icon: <MenuIcon className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
    { id: 'offers', label: 'Offers & Loyalty', icon: <Gift className="w-4 h-4" /> },
    { id: 'tracking', label: 'Order Tracking', icon: <MapPin className="w-4 h-4" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      {/* Main Header - Always Visible */}
      <header className="bg-primary text-white">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Restaurant Title + Logo - Left */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src={sysConfig.logoUrl || '/favicon.png'}
                alt="Logo"
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.png'; }}
              />
              <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {restaurantName}
              </h1>
            </div>

            {/* Right Section */}
            {!isLoggedIn && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white border border-white/30 hover:border-white/60 rounded-xl transition-all duration-200 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm hover:bg-white/10"
              >
                <ShieldCheck className="w-4 h-4" />
                Login as Staff
              </button>
            )}
            {isLoggedIn && (
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Cart Icon */}
                <button
                  onClick={() => onModuleChange('cart')}
                  className={`relative p-2.5 rounded-lg transition-all ${
                    activeModule === 'cart' ? 'bg-white text-primary' : 'text-white hover:bg-primary-foreground/10'
                  }`}
                  title="Cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {/* Notifications Icon */}
                <button
                  onClick={() => onModuleChange('notifications')}
                  className={`relative p-2.5 rounded-lg transition-all ${
                    activeModule === 'notifications' ? 'bg-white text-primary' : 'text-white hover:bg-primary-foreground/10'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-foreground text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-semibold border border-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Icon */}
                <button
                  onClick={() => onModuleChange('profile')}
                  className={`relative p-2.5 rounded-lg transition-all ${
                    activeModule === 'profile' ? 'bg-white text-primary' : 'text-white hover:bg-primary-foreground/10'
                  }`}
                  title={user?.name || 'Profile'}
                >
                  <User className="w-6 h-6" />
                </button>

                {/* Settings Icon */}
                <button
                  onClick={() => onModuleChange('settings')}
                  className={`relative p-2.5 rounded-lg transition-all ${
                    activeModule === 'settings' ? 'bg-white text-primary' : 'text-white hover:bg-primary-foreground/10'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Module Navigation Bar - Below Header, Only After Login */}
      {isLoggedIn && showModuleNav && (
        <nav className="bg-white border-b border-border">
          <div className="max-w-[1920px] mx-auto px-6">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
              {navItems.map((item) => {
                const active = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onModuleChange(item.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap text-sm font-medium
                      ${active ? 'bg-primary text-white shadow-sm' : 'text-foreground hover:bg-secondary'}
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.id === 'cart' && cartItemCount > 0 && !active && (
                      <span className="ml-1 bg-destructive text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}