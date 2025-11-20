export const debounceAsync = <T extends (...args: any[]) => Promise<any>>(
    func: T,
    delay: number
) => {
    let timeout: NodeJS.Timeout
    let controller: AbortController | null = null

    return (...args: Parameters<T>) => {
        if (controller) controller.abort()
        controller = new AbortController()

        clearTimeout(timeout)
        timeout = setTimeout(() => {
            func(...args, controller?.signal).catch(() => { })
        }, delay)
    }
}
