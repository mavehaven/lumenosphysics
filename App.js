import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ChevronRight, Lock, Bell, 
  LogOut, Home, BookOpen, LineChart, Book, Crown 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const TopicCard = ({ title, description, isLocked, href, className = "" }) => (
  <a
    href={href}
    className={`group relative bg-white rounded-lg shadow p-4 hover:shadow-lg 
      transition-all duration-200 transform hover:-translate-y-1 ${className}`}
  >
    {isLocked && (
      <div className="absolute inset-0 bg-gray-50/90 rounded-lg flex items-center justify-center flex-col">
        <Lock className="w-6 h-6 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">Upgrade to unlock</span>
      </div>
    )}
    <h3 className="font-bold text-blue-800 group-hover:text-blue-600">{title}</h3>
    <p className="text-gray-600 text-sm mt-2">{description}</p>
  </a>
);

const AuthModal = ({ isOpen, onClose, onGoogleSignIn, onEmailSignIn, onCreateAccount }) => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      if (isRegistration) {
        await onCreateAccount(email, password);
      } else {
        await onEmailSignIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isRegistration ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition"
          >
            {isRegistration ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={() => setIsRegistration(!isRegistration)}
            className="text-blue-600 hover:text-blue-800 transition"
          >
            {isRegistration ? 'Already have an account? Sign in' : 'Need an account? Create one'}
          </button>
        </div>

        <div className="mt-4 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <button
          onClick={onGoogleSignIn}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
        >
          <img src="/api/placeholder/24/24" alt="Google" className="w-6 h-6" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

const PhysicsDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('Dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up authentication state observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'All Topics', href: '/topics' },
    { icon: <LineChart className="w-5 h-5" />, label: 'Progress', href: '/progress' },
    { icon: <Book className="w-5 h-5" />, label: 'Study Notes', href: '/notes' },
    { icon: <Crown className="w-5 h-5" />, label: 'Upgrade Plan', href: '/billing' },
  ];

  const topics = {
    'Mechanics': [
      { title: "Newton's First Law", description: "Law of Inertia Simulation", href: "/newtons-first-law" },
      { title: "Newton's Second Law", description: "Force and Acceleration", href: "/newtons-second-law" },
      { title: "Work and Power", description: "Energy Transfer Study", href: "/work-power", isLocked: true },
    ],
    'Waves & Optics': [
      { title: "Wave Properties", description: "Wave Behavior Simulation", href: "/waves" },
      { title: "Optics Lab", description: "Light & Lenses", href: "/optics", isLocked: true }
    ]
  };

  const handleEmailSignIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleCreateAccount = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-800 text-white"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-blue-800 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4">
          <div className="flex items-center mb-6">
            <img src="/api/placeholder/32/32" alt="Logo" className="h-8 w-8" />
            <span className="ml-2 text-lg font-bold text-white">Physics Sim</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center p-2 rounded-lg transition-colors
                  ${currentSection === item.label ? 'bg-blue-700 text-white' : 'text-blue-50 hover:bg-blue-700/50'}
                `}
                onClick={() => setCurrentSection(item.label)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="flex justify-between items-center px-6 py-3">
            <div className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Physics Topics</span>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.photoURL || "/api/placeholder/32/32"} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {Object.entries(topics).map(([section, sectionTopics]) => (
            <section key={section}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">{section}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionTopics.map((topic) => (
                  <TopicCard key={topic.title} {...topic} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
};

export default PhysicsDashboard;
