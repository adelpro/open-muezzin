import type { StateStorage } from "zustand/middleware"

export const extensionStorage: StateStorage = {
    getItem: (name: string): Promise<string | null> =>
        new Promise((resolve) => {
            chrome.storage.local.get(name, (items) => {
                resolve(items[name] || null)
            })
        }),

    setItem: (name: string, value: string): Promise<void> =>
        new Promise((resolve) => {
            chrome.storage.local.set({ [name]: value }, () => {
                resolve()
            })
        }),

    removeItem: (name: string): Promise<void> =>
        new Promise((resolve) => {
            chrome.storage.local.remove(name, () => {
                resolve()
            })
        }),
}
