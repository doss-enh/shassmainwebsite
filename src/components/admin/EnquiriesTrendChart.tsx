'use client'

import {AreaChart, Area, XAxis, ResponsiveContainer, Tooltip} from 'recharts'

export function EnquiriesTrendChart({data}: {data: {date: string; count: number}[]}) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{top: 8, right: 8, left: 8, bottom: 0}}>
          <defs>
            <linearGradient id="enquiriesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{fontSize: 11, fill: 'var(--muted)'}} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          />
          <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#enquiriesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
