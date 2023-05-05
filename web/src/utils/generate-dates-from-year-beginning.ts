import dayjs from "dayjs"

export function generateFatesFromYearBeginning() {
    const fisrtDayOfTheYear = dayjs().startOf('year')
    const today = new Date()

    const dates = []
    let compareDate = fisrtDayOfTheYear

    while(compareDate.isBefore(today)) {
        dates.push(compareDate.toDate())
        compareDate = compareDate.add(1, 'day')
    }

    return dates
}