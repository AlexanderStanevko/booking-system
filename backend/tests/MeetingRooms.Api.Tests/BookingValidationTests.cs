using MeetingRooms.Api.Common.Errors;
using Microsoft.AspNetCore.Http;

namespace MeetingRooms.Api.Tests;

public sealed class BookingValidationTests
{
    [Fact]
    public async Task New_reservations_must_start_strictly_after_now()
    {
        await using var context = new BookingTestContext();
        foreach (var minutes in new[] { -1, 0 })
        {
            var start = context.Clock.GetUtcNow().AddMinutes(minutes);
            var request = context.ValidRequest with { StartTime = start, EndTime = start.AddHours(1) };
            var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
            Assert.Equal(ErrorCodes.StartTimeNotInFuture, error.Code);
        }
    }

    [Fact]
    public async Task End_must_be_after_start()
    {
        await using var context = new BookingTestContext();
        foreach (var minutes in new[] { -1, 0 })
        {
            var request = context.ValidRequest with { EndTime = context.ValidRequest.StartTime.AddMinutes(minutes) };
            var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
            Assert.Equal(ErrorCodes.InvalidTimeRange, error.Code);
        }
    }

    [Fact]
    public async Task Inactive_rooms_cannot_be_booked()
    {
        await using var context = new BookingTestContext();
        var request = context.ValidRequest with { RoomId = context.InactiveRoom.Id };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.RoomInactive, error.Code);
    }

    [Fact]
    public async Task Missing_rooms_and_organizers_return_specific_not_found_errors()
    {
        await using var context = new BookingTestContext();
        var room = await Assert.ThrowsAsync<AppException>(() =>
            context.Reservations.CreateAsync(context.ValidRequest with { RoomId = Guid.NewGuid() }));
        var organizer = await Assert.ThrowsAsync<AppException>(() =>
            context.Reservations.CreateAsync(context.ValidRequest with { OrganizerId = Guid.NewGuid() }));
        Assert.Equal(ErrorCodes.RoomNotFound, room.Code);
        Assert.Equal(ErrorCodes.UserNotFound, organizer.Code);
        Assert.Equal(StatusCodes.Status404NotFound, room.StatusCode);
        Assert.Equal(StatusCodes.Status404NotFound, organizer.StatusCode);
    }

    [Fact]
    public async Task Titles_must_be_nonblank_and_within_the_length_limit()
    {
        await using var context = new BookingTestContext();
        foreach (var title in new[] { "   ", new string('x', 201) })
        {
            var error = await Assert.ThrowsAsync<AppException>(() =>
                context.Reservations.CreateAsync(context.ValidRequest with { Title = title }));
            Assert.Equal(ErrorCodes.InvalidRequest, error.Code);
        }

        var result = await context.Reservations.CreateAsync(context.ValidRequest with { Title = new string('x', 200) });
        Assert.Equal(200, result.Title.Length);
    }

    [Fact]
    public async Task Offsets_are_normalized_to_utc()
    {
        await using var context = new BookingTestContext();
        var request = context.ValidRequest with
        {
            StartTime = context.ValidRequest.StartTime.ToOffset(TimeSpan.FromHours(3)),
            EndTime = context.ValidRequest.EndTime.ToOffset(TimeSpan.FromHours(3))
        };
        var result = await context.Reservations.CreateAsync(request);
        Assert.Equal(TimeSpan.Zero, result.StartTime.Offset);
        Assert.Equal(TimeSpan.Zero, result.EndTime.Offset);
        Assert.Equal(request.StartTime, result.StartTime);
    }
}
