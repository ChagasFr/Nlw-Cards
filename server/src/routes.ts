import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from './lib/prisma'
import dayjs from 'dayjs'

export async function appRoutes(app: FastifyInstance) {
    app.post('/habits', async () => {
        const createHabitBody = z.object({
            title: z.string(),
            weekDays: z.array(
                z.number()).min(0).max(6)
        })

        const { title, weekDays } = createHabitBody.parse(request.body)

        const today = dayjs().starOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map(weekDays => {
                        return {
                            week_day: weekDays,
                        }
                    })
                }
            }
        })

    })

    app.get('/day', async (request) => {
        const getDayParams = z.object ({
            date: z.coerce.date()
        })

        const { date } = getDayParams.parse(request.query)

        const parseDate = dayjs(date).starOf('day')
        const weekDay = parseDate.get('day')

        // todos hábitos possiveis
        // hábitos que já foram completados

        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at: {
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekDay,
                    }
                }
            }

        })

        const day = await prisma.day.findUnique ({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true,
            }
        })

        const completedHabits= day?.dayHabits.map(dayHabits => {
            return dayHabits.habit_id
        })

        return {
            possibleHabits,
            completedHabits
        } ?? []
    })

    // compeltar / nao-completar um habito

    app.patch('/habits/:id/toggle', async (request) => {
        // route param => parametro de identificacao
        const toggleHabitParams = z.object({
            id: z.string().uuid(),
        })

        const { id } = toggleHabitParams.parse(request.params)

        const today = dayjs().startOf('day').toDate()

        let day = await prisma.day.findUnique ({
            where: {
                date: today,
            }
        })

        if (!day) {
            day = await prisma.day.create ({
                data: {
                    date: today,
                }
            })
        }

        const dayHabit = await prisma.dayHabit.findUnique ({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id,
                }
            }
        })

        if (dayHabit) {
            await prisma.dayHabit.delete ({
                where: {
                    id: dayHabit.id,
                }
            })
        } else {
            // completar o habito
            await prisma.dayHabit.create ({
                data: {
                    day_id: day.id,
                    habit_id: id,
                }
            })
        }
    })

    app.get('summary', async() => {
        // Query mais complexa, mais condicoes, relacionamento => SQL na mao (RAW)
        // Prisma ORM: RAW SQL => SQLite

        const summary = await prisma.$queryRaw`
        SELECT 
            D.id, 
            D.date,
            (
                SELECT
                    cast(count(*) as float)
                FROM day_habits DH
                WHERE DH.day =D.id
            )   as completed,
            ( 
                SELECT
                    cast(count(*) as float)
                FROM habit_week_days HWD
                JOIN habits H
                    ON H.id = HWD.habit_id
                WHERE
                    HWD.weekday = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
                    AND H.created_at ≤ D.date
            )   as amount
        FROM days D
        `

        return summary
    })

}

