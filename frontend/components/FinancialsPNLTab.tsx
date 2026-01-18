'use client'

import React from 'react'

interface FinancialsPNLTabProps {
    symbol: string
    period: 'quarterly' | 'annual'
    nature: 'standalone' | 'consolidated'
}

export function FinancialsPNLTab({ symbol, period, nature }: FinancialsPNLTabProps) {
    return (
        <div className="p-4 border border-border rounded-lg bg-panel">
            <div className="text-center text-text-secondary">
                <p>PNL Data for {symbol}</p>
                <p className="text-sm">Period: {period}, Nature: {nature}</p>
                <p className="mt-2">Data visualization coming soon</p>
            </div>
        </div>
    )
}
