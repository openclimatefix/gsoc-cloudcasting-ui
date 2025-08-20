'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';

const Header = () => {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const popupRef = useRef<HTMLDivElement>(null);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div className="p-4 bg-black text-white flex items-center justify-between">
      <div className="font-bold text-xl">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 145 50" fill="none" className="h-8">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.5"
            d="m37.947 46.703 21.74-21.85-21.74-21.85M24.361 3 2.622 24.85l21.74 21.85M94.9 3 73.161 24.85l21.74 21.85M131.059 3 109.32 24.85l21.739 21.85M129.174 26.845l12.755-12.755"
          ></path>
        </svg>
        {/* <Link href="/">CloudCasting</Link> */}
      </div>

      <div className="relative" ref={popupRef}>
        <button
          onClick={togglePopup}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 hover:bg-gray-400 transition"
          aria-label="User menu"
        >
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              className="w-8 h-8 rounded-full"
              width={32}
              height={32}
            />
          ) : (
            <User size={20} />
          )}
        </button>

        {showPopup && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-10">
            <a
              href="mailto:support@quartz.solar"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Contact
            </a>
            <a
              href="https://forms.gle/boBNEab5u99ug5ReA"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Give feedback
            </a>

            <hr className="my-2 border-gray-200" />

            {/* Footer */}
            <div className="px-4 py-2 text-xs text-gray-500">Version 0.0.1</div>
            {isAuthenticated ? (
              <div className="px-4 py-2 text-xs text-gray-500">
                Signed in as <br />
                <span className="font-medium">{user?.email || user?.name}</span>
              </div>
            ) : (
              <div className="px-4 py-2 text-xs text-gray-500">Not signed in</div>
            )}

            <hr className="my-2 border-gray-200" />
            {isAuthenticated ? (
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={() => {
                  signOut();
                }}
              >
                Sign out
              </button>
            ) : (
              <button
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                onClick={() => {
                  router.push('/login');
                }}
              >
                Sign in
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
