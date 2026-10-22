using MeetingRooms.Api.Common.Errors;
using Microsoft.AspNetCore.Http;

namespace MeetingRooms.Api.Tests;

public sealed class BookingLimitTests
{
    [Fact]
    public async Task Duration_limit_allows_exactly_seven_days()
    {
        await using var context = new BookingTestContext();
        var maximum = context.ValidRequest with { EndTime = context.ValidRequest.StartTime.AddDays(7) };
        Assert.NotNull(await context.Reservations.CreateAsync(maximum));
        var error = await Assert.ThrowsAsync<AppException>(() =>
            context.Reservations.CreateAsync(maximum with { EndTime = maximum.EndTime.AddDays(1) }));
        Assert.Equal(ErrorCodes.MaxDurationExceeded, error.Code);
        Assert.Equal(StatusCodes.Status400BadRequest, error.StatusCode);
    }

    [Fact]
    public async Task Horizon_limit_allows_exactly_ninety_days()
    {
        await using var context = new BookingTestContext();
        var start = context.Clock.GetUtcNow().AddDays(90);
        Assert.NotNull(await context.Reservations.CreateAsync(context.ValidRequest with { StartTime = start, EndTime = start.AddHours(1) }));
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(context.ValidRequest with
        {
            StartTime = start.AddDays(1),
            EndTime = start.AddDays(1).AddHours(1)
        }));
        Assert.Equal(ErrorCodes.BookingHorizonExceeded, error.Code);
    }

    [Fact]
    public async Task Capacity_requires_positive_attendees_within_capacity()
    {
        await using var context = new BookingTestContext();
        foreach (var attendees in new[] { 0, -1, 11 })
        {
            var error = await Assert.ThrowsAsync<AppException>(() =>
                context.Reservations.CreateAsync(context.ValidRequest with { AttendeeCount = attendees }));
            Assert.Equal(attendees <= 0 ? ErrorCodes.InvalidAttendeeCount : ErrorCodes.RoomCapacityExceeded, error.Code);
        }

        Assert.NotNull(await context.Reservations.CreateAsync(context.ValidRequest with { AttendeeCount = context.FirstRoom.Capacity }));
    }

    [Fact]
    public async Task Configured_duration_and_horizon_limits_control_validation()
    {
        await using var context = new BookingTestContext();
        context.Limits.MaxDurationDays = 1;
        context.Limits.MaxAdvanceBookingDays = 1;
        var start = context.Clock.GetUtcNow().AddDays(2);
        var request = context.ValidRequest with { StartTime = start, EndTime = start.AddDays(2) };
        var durationError = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.MaxDurationExceeded, durationError.Code);
        context.Limits.MaxDurationDays = 2;
        var horizonError = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.BookingHorizonExceeded, horizonError.Code);
        context.Limits.MaxAdvanceBookingDays = 2;
        Assert.NotNull(await context.Reservations.CreateAsync(request));
    }
}
