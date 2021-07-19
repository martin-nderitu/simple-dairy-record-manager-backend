export default function isNumeric(value: any): boolean {
    return (typeof value === "number" && !isNaN(value)) ||
        (typeof value === "string" && value.trim().length > 0 && !isNaN(Number(value)));
}
