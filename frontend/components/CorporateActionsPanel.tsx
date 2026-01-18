'use client'

import React from 'react'

interface CorporateActionsPanelProps {
    symbol: string
}

export function CorporateActionsPanel({ symbol }: CorporateActionsPanelProps) {
    return (
        <div className="p-4 border border-border rounded-lg bg-panel">
            <div className="text-center text-text-secondary">
                <p>Corporate Actions for {symbol}</p>
                <p className="mt-2">Dividends, Splits, and more coming soon</p>
            </div>
        </div>
    )
}
