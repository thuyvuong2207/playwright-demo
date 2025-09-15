export function moneyStringToNumber(money: string): number {
    return Number(money.replace(/[^0-9.-]+/g, ""));
}

export function formatPhoneCA(numberPhone: string): string{
    if(numberPhone.length !== 10){
        throw new Error("Invalid number phone. It must be 10 characters long.")
    }
    return `(+1) ${numberPhone.slice(0,3)}-${numberPhone.slice(3,6)}-${numberPhone.slice(-4)}`;
}

  