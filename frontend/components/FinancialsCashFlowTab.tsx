'use client'

import React from 'react'

interface FinancialsCashFlowTabProps {
    symbol: string
    period: 'quarterly' | 'annual'
    nature: 'standalone' | 'consolidated'
}

export function FinancialsCashFlowTab({ symbol, period, nature }: FinancialsCashFlowTabProps) {
    return (
        <div className="p-4 border border-border rounded-lg bg-panel">
            <div className="text-center text-text-secondary">
                <p>Cash Flow Data for {symbol}</p>
                <p className="text-sm">Period: {period}, Nature: {nature}</p>
                <p className="mt-2">Data visualization coming soon</p>
            </div>
        </div>
    )
}
