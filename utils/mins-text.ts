
export function minsToText(minutes: number) {
    if(minutes === 0) return "0 mins"

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins} mins`
    }

    return `${hours} hrs ${mins} mins`
}