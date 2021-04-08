export async function retryAction(
    numberOfRetries: number,
    action: () => Promise<unknown>,
    errorMessage?: string,
    retryInterval = 10000
): Promise<void> {
    const wait = () =>
        new Promise((resolve) => setTimeout(resolve, retryInterval));

    for (let i = 0; i < numberOfRetries; i++) {
        try {
            await action();
            return;
        } catch (error) {
            await wait();
        }
    }

    throw new Error(errorMessage);
}
