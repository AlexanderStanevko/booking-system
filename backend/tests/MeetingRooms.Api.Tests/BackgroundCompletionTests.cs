using MeetingRooms.Api.Configuration;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.Models;
using MeetingRooms.Api.Services.Reservations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Time.Testing;

namespace MeetingRooms.Api.Tests;

public sealed class BackgroundCompletionTests
{
    [Fact]
    public async Task Worker_completes_expired_reservations_without_user_actions()
    {
        var clock = new ObservedClock();
        var observer = new CompletionObserver();
        var databaseName = Guid.NewGuid().ToString();
        var configuration = new ConfigurationBuilder().Build();
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddMeetingRoomServices(configuration);
        services.AddSingleton<TimeProvider>(clock);
        services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase(databaseName).AddInterceptors(observer));
        await using var provider = services.BuildServiceProvider();
        DateTimeOffset end;
        await using (var scope = provider.CreateAsyncScope())
        {
            await scope.ServiceProvider.GetRequiredService<DatabaseSeeder>().SeedAsync();
            var database = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var reservation = await database.Reservations.Where(reservation => reservation.Status == ReservationStatus.Booked)
                .OrderBy(reservation => reservation.EndTime).FirstAsync();
            observer.TargetId = reservation.Id;
            end = reservation.EndTime;
        }

        var worker = Assert.IsType<ReservationCompletionWorker>(Assert.Single(provider.GetServices<IHostedService>()));
        clock.ObserveReads = true;
        await worker.StartAsync(CancellationToken.None);
        try
        {
            await clock.TimerCreated.Task.WaitAsync(TimeSpan.FromSeconds(10));
            await clock.FirstRead.Task.WaitAsync(TimeSpan.FromSeconds(10));
            clock.Inner.Advance(end - clock.GetUtcNow());
            await observer.Completed.Task.WaitAsync(TimeSpan.FromSeconds(10));
            await using var scope = provider.CreateAsyncScope();
            var database = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var reservation = await database.Reservations.FindAsync(observer.TargetId);
            Assert.Equal(ReservationStatus.Completed, reservation!.Status);
            Assert.Null(reservation.ActualEndTime);
        }
        finally
        {
            await worker.StopAsync(CancellationToken.None);
        }
    }

    private sealed class ObservedClock : TimeProvider
    {
        public FakeTimeProvider Inner { get; } = new(new DateTimeOffset(2030, 1, 1, 12, 0, 0, TimeSpan.Zero));
        public TaskCompletionSource TimerCreated { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public TaskCompletionSource FirstRead { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public bool ObserveReads { get; set; }

        public override DateTimeOffset GetUtcNow()
        {
            var now = Inner.GetUtcNow();
            if (ObserveReads)
            {
                FirstRead.TrySetResult();
            }

            return now;
        }

        public override ITimer CreateTimer(TimerCallback callback, object? state, TimeSpan dueTime, TimeSpan period)
        {
            var timer = Inner.CreateTimer(callback, state, dueTime, period);
            TimerCreated.TrySetResult();
            return timer;
        }
    }

    private sealed class CompletionObserver : SaveChangesInterceptor
    {
        public Guid TargetId { get; set; }
        public TaskCompletionSource Completed { get; } = new(TaskCreationOptions.RunContinuationsAsynchronously);

        public override ValueTask<int> SavedChangesAsync(
            SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
        {
            if (eventData.Context!.ChangeTracker.Entries<Reservation>()
                .Any(entry => entry.Entity.Id == TargetId && entry.Entity.Status == ReservationStatus.Completed))
            {
                Completed.TrySetResult();
            }

            return ValueTask.FromResult(result);
        }
    }
}
