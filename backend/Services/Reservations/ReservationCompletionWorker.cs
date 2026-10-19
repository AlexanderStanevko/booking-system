using MeetingRooms.Api.Configuration;
using Microsoft.Extensions.Options;

namespace MeetingRooms.Api.Services.Reservations;

public sealed class ReservationCompletionWorker(
    IServiceScopeFactory scopeFactory, ReservationLock reservationLock, TimeProvider clock,
    IOptions<BookingOptions> options, ILogger<ReservationCompletionWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(options.Value.CompletionIntervalSeconds), clock);
        do
        {
            try
            {
                using var lease = await reservationLock.AcquireAsync(stoppingToken);
                await using var scope = scopeFactory.CreateAsyncScope();
                var completion = scope.ServiceProvider.GetRequiredService<ReservationCompletion>();
                await completion.FinalizeExpiredAsync(clock.GetUtcNow(), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Failed to finalize expired reservations.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
