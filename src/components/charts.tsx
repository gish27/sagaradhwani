"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AudienceChart({ data }: { data: { platform: string; views: number; reach: number; followers: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
        <Tooltip formatter={(v) => new Intl.NumberFormat("en-IN").format(Number(v))} />
        <Legend />
        <Bar dataKey="views" fill="#1c1917" radius={[3, 3, 0, 0]} />
        <Bar dataKey="reach" fill="#d97706" radius={[3, 3, 0, 0]} />
        <Bar dataKey="followers" fill="#14532d" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BreakEvenChart({ data }: { data: { taluks: number; lean: number; five: number; middle: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey="taluks" tick={{ fontSize: 12 }} label={{ value: "taluks", position: "insideBottomRight", offset: -4, fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
        <Tooltip formatter={(v) => `₹${new Intl.NumberFormat("en-IN").format(Number(v))}`} labelFormatter={(l) => `${l} taluk(s)`} />
        <Legend />
        <Line type="monotone" dataKey="lean" name="A · Lean" stroke="#14532d" strokeWidth={2} dot />
        <Line type="monotone" dataKey="middle" name="C · Middle path" stroke="#d97706" strokeWidth={2} dot />
        <Line type="monotone" dataKey="five" name="B · Five-person" stroke="#b91c1c" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TurnaroundChart({ data }: { data: { title: string; hours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
        <YAxis type="category" dataKey="title" width={180} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => `${v} h`} />
        <Bar dataKey="hours" fill="#1c1917" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
