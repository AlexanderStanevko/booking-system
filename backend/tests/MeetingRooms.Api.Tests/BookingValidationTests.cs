using MeetingRooms.Api.Common.Errors;
using Microsoft.AspNetCore.Http;

namespace MeetingRooms.Api.Tests;

public sealed class BookingValidationTests
{
    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public async Task New_reservations_must_start_strictly_after_now(int minutes)
    {
        await using var context = new BookingTestContext();
        var start = context.Clock.GetUtcNow().AddMinutes(minutes);
        var request = context.ValidRequest with { StartTime = start, EndTime = start.AddHours(1) };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.StartTimeNotInFuture, error.Code);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public async Task End_must_be_after_start(int minutes)
    {
        await using var context = new BookingTestContext();
        var request = context.ValidRequest with { EndTime = context.ValidRequest.StartTime.AddMinutes(minutes) };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.InvalidTimeRange, error.Code);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Only_active_rooms_can_be_booked(bool active)
    {
        await using var context = new BookingTestContext();
        var request = context.ValidRequest with { RoomId = active ? context.FirstRoom.Id : context.InactiveRoom.Id };
        if (active)
        {
            Assert.NotNull(await context.Reservations.CreateAsync(request));
            return;
        }

        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.RoomInactive, error.Code);
    }

    [Fact]
    public async Task Room_must_exist()
    {
        await using var context = new BookingTestContext();
        var request = context.ValidRequest with { RoomId = Guid.NewGuid() };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.RoomNotFound, error.Code);
        Assert.Equal(StatusCodes.Status404NotFound, error.StatusCode);
    }

    [Fact]
    public async Task Organizer_must_exist()
    {
        await using var context = new BookingTestContext();
        var request = context.ValidRequest with { OrganizerId = Guid.NewGuid() };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.UserNotFound, error.Code);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Empty_titles_are_rejected(string title)
    {
        await using var context = new BookingTestContext();
        var error = await Assert.ThrowsAsync<AppException>(() =>
            context.Reservations.CreateAsync(context.ValidRequest with { Title = title }));
        Assert.Equal(ErrorCodes.InvalidRequest, error.Code);
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
