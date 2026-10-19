using MeetingRooms.Api.Common.Errors;
using Microsoft.AspNetCore.Http;

namespace MeetingRooms.Api.Tests;

public sealed class BookingLimitTests
{
    [Theory]
    [InlineData(6, true)]
    [InlineData(7, true)]
    [InlineData(8, false)]
    public async Task Duration_limit_allows_exactly_seven_days(int days, bool allowed)
    {
        await using var context = new BookingTestContext();
        var request = context.ValidRequest with { EndTime = context.ValidRequest.StartTime.AddDays(days) };
        if (allowed)
        {
            Assert.NotNull(await context.Reservations.CreateAsync(request));
            return;
        }

        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.MaxDurationExceeded, error.Code);
        Assert.Equal(StatusCodes.Status400BadRequest, error.StatusCode);
    }

    [Theory]
    [InlineData(89, true)]
    [InlineData(90, true)]
    [InlineData(91, false)]
    public async Task Horizon_limit_allows_exactly_ninety_days(int days, bool allowed)
    {
        await using var context = new BookingTestContext();
        var start = context.Clock.GetUtcNow().AddDays(days);
        var request = context.ValidRequest with { StartTime = start, EndTime = start.AddHours(1) };
        if (allowed)
        {
            Assert.NotNull(await context.Reservations.CreateAsync(request));
            return;
        }

        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.BookingHorizonExceeded, error.Code);
    }

    [Theory]
    [InlineData(5, true)]
    [InlineData(10, true)]
    [InlineData(11, false)]
    [InlineData(0, false)]
    [InlineData(-1, false)]
    public async Task Capacity_requires_positive_attendees_within_capacity(int attendees, bool allowed)
    {
        await using var context = new BookingTestContext();
        var request = context.ValidRequest with { AttendeeCount = attendees };
        if (allowed)
        {
            Assert.NotNull(await context.Reservations.CreateAsync(request));
            return;
        }

        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(attendees <= 0 ? ErrorCodes.InvalidAttendeeCount : ErrorCodes.RoomCapacityExceeded, error.Code);
    }

    [Fact]
    public async Task Configured_duration_limit_changes_validation()
    {
        await using var context = new BookingTestContext();
        context.Limits.MaxDurationDays = 1;
        var request = context.ValidRequest with { EndTime = context.ValidRequest.StartTime.AddDays(2) };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.MaxDurationExceeded, error.Code);
        context.Limits.MaxDurationDays = 2;
        Assert.NotNull(await context.Reservations.CreateAsync(request));
    }

    [Fact]
    public async Task Configured_horizon_changes_validation()
    {
        await using var context = new BookingTestContext();
        context.Limits.MaxAdvanceBookingDays = 1;
        var start = context.Clock.GetUtcNow().AddDays(2);
        var request = context.ValidRequest with { StartTime = start, EndTime = start.AddHours(1) };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.BookingHorizonExceeded, error.Code);
        context.Limits.MaxAdvanceBookingDays = 2;
        Assert.NotNull(await context.Reservations.CreateAsync(request));
    }
}
