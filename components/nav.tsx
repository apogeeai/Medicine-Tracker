"use client";

import { useState } from 'react';
import { Menu, X, Pill } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[60px] bg-background/80 backdrop-blur-sm z-50 border-b">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">MediTrack</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            History
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Settings
          </a>
          <ModeToggle />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-background/95 backdrop-blur-sm border-b p-4">
          <div className="flex flex-col gap-4">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              History
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Settings
            </a>
            <div className="pt-2 border-t">
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 