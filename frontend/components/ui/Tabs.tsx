'use client'

import React, { ReactElement, ReactNode } from 'react'

interface TabProps {
    value: string
    label: string
    children: ReactNode
}

export function Tab({ children }: TabProps) {
    return <>{children}</>
}

interface TabsProps {
    value: string
    onValueChange: (value: any) => void
    children: ReactNode
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
    // Filter for valid elements to access props safely
    const tabs = React.Children.toArray(children).filter(
        (child): child is ReactElement<TabProps> => React.isValidElement(child)
    )

    return (
        <div className="w-full">
            <div className="flex border-b border-border mb-6 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = tab.props.value === value
                    return (
                        <button
                            key={tab.props.value}
                            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-secondary'
                                }`}
                            onClick={() => onValueChange(tab.props.value)}
                        >
                            {tab.props.label}
                        </button>
                    )
                })}
            </div>
            <div>
                {tabs.map((tab) => {
                    if (tab.props.value === value) {
                        return <div key={tab.props.value}>{tab.props.children}</div>
                    }
                    return null
                })}
            </div>
        </div>
    )
}
