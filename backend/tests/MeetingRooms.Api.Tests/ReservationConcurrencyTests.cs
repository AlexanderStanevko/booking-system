using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Tests;

public sealed class ReservationConcurrencyTests
{
    [Fact]
    public async Task Simultaneous_requests_cannot_double_book_the_same_room()
    {
        await using var context = new BookingTestContext();
        await using var firstDatabase = new ApplicationDbContext(context.DatabaseOptions);
        await using var secondDatabase = new ApplicationDbContext(context.DatabaseOptions);
        var start = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var requests = new[]
        {
            AttemptAsync(firstDatabase, context.FirstUser.Id),
            AttemptAsync(secondDatabase, context.SecondUser.Id)
        };
        start.SetResult();
        var results = await Task.WhenAll(requests);
        Assert.Single(results, result => result is null);
        Assert.Single(results, result => result == ErrorCodes.RoomAlreadyBooked);
        Assert.Equal(1, await context.Database.Reservations.CountAsync());

        Task<string?> AttemptAsync(ApplicationDbContext database, Guid organizerId)
            => Task.Run(async () =>
            {
                await start.Task;
                try
                {
                    await context.CreateService(database).CreateAsync(context.ValidRequest with { OrganizerId = organizerId });
                    return null;
                }
                catch (AppException exception)
                {
                    return exception.Code;
                }
            });
    }
}
