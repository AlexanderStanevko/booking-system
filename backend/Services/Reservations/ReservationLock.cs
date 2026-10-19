namespace MeetingRooms.Api.Services.Reservations;

public sealed class ReservationLock : IDisposable
{
    private readonly SemaphoreSlim semaphore = new(1, 1);

    public async Task<IDisposable> AcquireAsync(CancellationToken cancellationToken = default)
    {
        await semaphore.WaitAsync(cancellationToken);
        return new Lease(semaphore);
    }

    public void Dispose() => semaphore.Dispose();

    private sealed class Lease(SemaphoreSlim semaphore) : IDisposable
    {
        private int released;

        public void Dispose()
        {
            if (Interlocked.Exchange(ref released, 1) == 0)
            {
                semaphore.Release();
            }
        }
    }
}
