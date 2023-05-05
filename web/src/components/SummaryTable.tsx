import { useEffect, useState } from "react"
import { generateFatesFromYearBeginning } from "../utils/generate-dates-from-year-beginning"
import { HabitDay } from "./habitsDay"
import { AppWindow } from "phosphor-react"
import dayjs from "dayjs"

const weekDays = [ 'D', 'S', 'T', 'Q', 'Q', 'S', 'S' ]

const summaryDates = generateFatesFromYearBeginning()

const minimumSummaryDatesSize = 18 * 7 // 18 weeks
const amountOfDaysTofill = minimumSummaryDatesSize - summaryDates.length

type Summary = {
    id: string;
    date: string;
    amount: string;
    completed: string;
}[]

export function SummaryTable() {
    const [summary, setSummary] = useState<Summary>([])

    useEffect(() => {
        api.get('summary').then(Response => {
            setSummary(Response.data)
        })
    }, []) 
    return(
        <div className="w-full flex ">
            <div className="grid grid-rows-7 grid-flow-row gap">
                {weekDays.map((weekDay, i) => {
                    return (
                        <div key={`${weekDay}-${i}`} className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center">
                            {weekDay}
                        </div>
                    )
                })}
            </div>


            <div className="grid grid-rows-7 grid-flow-col gap-3">
                {summary.length > 0 && summaryDates.map(date => {
                    const dayInSummary = summary.find(day => {
                        return dayjs(date).isSame(day.date, 'day')
                    })

                    return (
                        <HabitDay 
                            key={date.toString()}
                            date={date}
                            amount={dayInSummary?.amount} 
                            defaultCompleted={dayInSummary?.completed} 
                        />
                    )
                })}

                {amountOfDaysTofill > 0 && Array.from({ length: amountOfDaysTofill}).map((_, i) => {
                    return(
                        <div key={i} className="w-10 h-10 bg-zinc-900 boerder-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"></div>
                    )
                })}
            </div>
        </div>
    )
}