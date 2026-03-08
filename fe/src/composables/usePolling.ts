import { ref, onUnmounted } from 'vue'

/**
 * Generic polling hook that calls a poll function every `intervalMs` milliseconds
 * until a stop condition is met or the component is unmounted.
 */
export function usePolling(
    pollFn: () => Promise<string>,
    stopCondition: (status: string) => boolean,
    intervalMs = 2000
) {
    const status = ref<string>('pending')
    const isPolling = ref(false)
    let timerId: ReturnType<typeof setInterval> | null = null

    function startPolling(): void {
        if (isPolling.value) return
        isPolling.value = true
        timerId = setInterval(async () => {
            try {
                const result = await pollFn()
                status.value = result
                if (stopCondition(result)) {
                    stopPolling()
                }
            } catch (e) {
                stopPolling()
            }
        }, intervalMs)
    }

    function stopPolling(): void {
        isPolling.value = false
        if (timerId !== null) {
            clearInterval(timerId)
            timerId = null
        }
    }

    onUnmounted(stopPolling)

    return { status, isPolling, startPolling, stopPolling }
}
