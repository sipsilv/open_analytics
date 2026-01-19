'use client'

import { Menu, X } from 'lucide-react'
import { useNavigationStore } from '@/lib/store'

export function MobileHeader() {
    const { isMobileMenuOpen, toggleMobileMenu } = useNavigationStore()

    return (
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-panel dark:bg-[#0a1020] border-b border-border dark:border-[#1f2a44] sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <h1 className="text-lg font-sans font-semibold text-text-primary tracking-tight">
                    OPEN ANALYTICS
                </h1>
            </div>

            {/* Any mobile-specific actions could go here */}
            <div className="flex items-center">
                {/* Placeholder for future mobile profile/notification icon */}
            </div>
        </header>
    )
}
