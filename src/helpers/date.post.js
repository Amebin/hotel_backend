function getDates( limitDays = 1, startDate) {
    if (!startDate) {
        startDate = new Date()
    }

    const oneDay = 24 * 60 * 60 * 1000
    const dates = []
    let currentDate = startDate

    while (dates.length < limitDays) {
        dates.push(new Date(currentDate))
        currentDate = new Date(currentDate.getTime() + oneDay)
    }

    return dates
}
//añadir current day al endpoint de reservar habitación
export default getDates