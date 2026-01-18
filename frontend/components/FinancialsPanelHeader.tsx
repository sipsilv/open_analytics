'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'

interface FinancialsPanelHeaderProps {
    symbol: string
}

export function FinancialsPanelHeader({ symbol }: FinancialsPanelHeaderProps) {
    return (
        <div className="mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Financials for {symbol}</h2>
        </div>
    )
}
