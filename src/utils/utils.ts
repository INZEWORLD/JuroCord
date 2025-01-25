import { Logger, Tags } from "@_immails/logger"

export const noun = (number : number, one : string, from_two : string, zero_or_from_five : string) => {
    let abs = Math.abs(number);
    abs %= 100;
    if (abs >= 5 && abs <= 20) return zero_or_from_five;
    abs %= 10;
    return abs === 1 ? one : abs >= 2 && abs <= 4 ? from_two : zero_or_from_five;
}
export const wait = (ms : number) => new Promise((resolve) => setTimeout(() => resolve(ms), ms))
export const logBotInfo = (...data : any) => Logger.log([Tags.INFO, Tags.get("bot")], ...data)
export const logBotWarn = (...data : any) => Logger.log([Tags.WARN, Tags.get("bot")], ...data)
export const logBotError = (...data : any) => Logger.log([Tags.ERROR, Tags.get("bot")], ...data)