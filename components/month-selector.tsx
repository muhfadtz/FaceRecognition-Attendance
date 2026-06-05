"use client"

import type React from "react"
import { CustomSelect } from "@/components/ui/custom-select"

interface MonthSelectorProps {
    selectedMonth: string
    setSelectedMonth: (month: string) => void
    selectedYear: string
    setSelectedYear: (year: string) => void
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
}) => {
    const allMonths = [
        { value: "01", label: "Januari" },
        { value: "02", label: "Februari" },
        { value: "03", label: "Maret" },
        { value: "04", label: "April" },
        { value: "05", label: "Mei" },
        { value: "06", label: "Juni" },
        { value: "07", label: "Juli" },
        { value: "08", label: "Agustus" },
        { value: "09", label: "September" },
        { value: "10", label: "Oktober" },
        { value: "11", label: "November" },
        { value: "12", label: "Desember" },
    ]

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear()
        const startYear = 2025
        const endYear = currentYear + 2
        const years = []
        for (let year = startYear; year <= endYear; year++) {
            years.push(year.toString())
        }
        return years
    }

    const years = generateYearOptions()

    return (
        <div className="flex items-center gap-2">
            <CustomSelect
                value={selectedMonth}
                onChange={setSelectedMonth}
                options={allMonths}
                className="w-36"
            />
            <CustomSelect
                value={selectedYear}
                onChange={setSelectedYear}
                options={years.map((y) => ({ value: y, label: y }))}
                className="w-28"
            />
        </div>
    )
}

export default MonthSelector
