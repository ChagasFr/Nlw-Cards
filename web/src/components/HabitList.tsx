import * as CheckBox from '@radix-ui/react-checkbox'
import { Check } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import dayjs from 'dayjs';

interface HabitDayProps {
    date: Date;
    onCompletedChanged: (completed: number) => void
}

interface HabitsInfo {
    possibleHabits: {
        id: string;
        title: string;
        created_at: string;
    }[],
    completedHabits: string[]
}

export function HabitList ({ date }: HabitDayProps) {
    const[habitsInfo, setHabitsInfo] = useState<HabitsInfo>()

    useEffect(() => {
        api.get('day', {
            params: {
                date: date.toISOString(),
            }
        }).then(Response => {
            setHabitsInfo(Response.data)
        })
    }, [])

    async function handleToggleHbait(habitId: string) {
        await api.patch(`/habits/${habitId}/toogle`)

        const isHbaitAlreadyCompleted = habitsInfo?.completedHabits.includes(habitId)

        let completedHabits: string[] = []

        if(isHbaitAlreadyCompleted) {
            completedHabits = habitsInfo!.completedHabits.filter(id => id !== habitId)

        } else {
            completedHabits = [...habitsInfo!.completedHabits, habitId]
        }
        
        setHabitsInfo({
            possibleHabits: habitsInfo!.possibleHabits,
            completedHabits,
        })

        onCompletedChanged(completedHbaits.length)
    }

    const isDateInPast = dayjs(date).endOf('day').isBefore(new Date())

    return (
        <div className="mt-6 flex flex-col gap-3">
            {habitsInfo?.possibleHabits.map(habit => {
                return (
                    <CheckBox.Root 
                        key={habit.id} 
                        checked={habitsInfo.completedHabits.includes(habit.id)} 
                        onCheckedChange={() => handleToggleHbait(habit.id)}
                        disabled={isDateInPast}
                        className="flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed"
                    >
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 borde-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 group-focus:ring-2 group-focus:ring-violet-800 group-focus:ring-offset-2 group-focus:ring-offset-background'">
                            <CheckBox.Indicator>
                                <Check size={20} className="text-white"/>
                            </CheckBox.Indicator>
                        </div>
            
                            <span className="font-semibold text-xl text-white leading-tight group-data[state=checked]:line-through group-data[state=checked]:text-zinc-400">
                                {habit.title}
                            </span>
                    </CheckBox.Root>
                )
            })}
        </div>
    )
}