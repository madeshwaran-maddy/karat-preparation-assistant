"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  screenName: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Header({ screenName }: HeaderProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const candidateData = localStorage.getItem("candidate");
    if (candidateData) {
      setCandidate(JSON.parse(candidateData));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("candidate");
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - App name and screen name */}
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Karat Preparation Assistant
              </h1>
              <p className="text-sm text-gray-600">{screenName}</p>
            </div>
          </div>

          {/* Right side - User icon and dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition duration-200 cursor-pointer"
              title={candidate?.name || "User"}
            >
              <span className="text-white font-semibold text-sm">
                {candidate ? getInitials(candidate.name) : "U"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                {candidate && (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {getInitials(candidate.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Role */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-xs text-gray-600 font-semibold">ROLE</p>
                      <p className="text-sm text-gray-900 mt-1 capitalize">
                        {candidate.role === "candidate"
                          ? "Candidate"
                          : "Lead / Reviewer"}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push("/dashboard");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                      >
                        Dashboard
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="px-4 py-3 border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
