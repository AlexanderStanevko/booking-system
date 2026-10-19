using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Tests;

public sealed class ReservationQueryTests
{
    [Fact]
    public async Task Filters_can_be_combined_and_include_intersecting_reservations()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        await context.AddReservationAsync(reservation =>
        {
            reservation.RoomId = context.SecondRoom.Id;
            reservation.OrganizerId = context.SecondUser.Id;
        });
        var result = await context.Queries.ListAsync(new ReservationFilter
        {
            RoomId = existing.RoomId,
            OrganizerId = existing.OrganizerId,
            Status = ReservationStatus.Booked,
            From = existing.StartTime.AddMinutes(15),
            To = existing.EndTime.AddMinutes(-15)
        });
        Assert.Equal(existing.Id, Assert.Single(result).Id);
    }

    [Fact]
    public async Task Date_ranges_are_half_open_and_support_one_sided_bounds()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        Assert.Empty(await context.Queries.ListAsync(new() { From = existing.EndTime }));
        Assert.Empty(await context.Queries.ListAsync(new() { To = existing.StartTime }));
        Assert.Single(await context.Queries.ListAsync(new() { From = existing.StartTime }));
        Assert.Single(await context.Queries.ListAsync(new() { To = existing.EndTime }));
    }

    [Fact]
    public async Task Completed_status_filter_finalizes_expired_bookings_first()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        context.Clock.SetUtcNow(existing.EndTime);
        var result = Assert.Single(await context.Queries.ListAsync(new() { Status = ReservationStatus.Completed }));
        Assert.Equal(existing.Id, result.Id);
        Assert.Null(result.ActualEndTime);
        Assert.Empty(await context.Queries.ListAsync(new() { Status = ReservationStatus.Booked }));
    }

    [Fact]
    public async Task Date_filters_use_the_effective_end_of_early_completed_meetings()
    {
        await using var context = new BookingTestContext();
        var now = context.Clock.GetUtcNow();
        await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = now.AddHours(-2);
            reservation.EndTime = now.AddHours(1);
            reservation.ActualEndTime = now.AddHours(-1);
            reservation.Status = ReservationStatus.Completed;
        });
        Assert.Empty(await context.Queries.ListAsync(new() { From = now }));
        Assert.Single(await context.Queries.ListAsync(new() { To = now.AddHours(-1) }));
    }

    [Fact]
    public async Task Invalid_date_ranges_and_unknown_statuses_are_rejected()
    {
        await using var context = new BookingTestContext();
        var error = await Assert.ThrowsAsync<AppException>(() => context.Queries.ListAsync(new()
        {
            From = context.Clock.GetUtcNow(),
            To = context.Clock.GetUtcNow()
        }));
        Assert.Equal(ErrorCodes.InvalidTimeRange, error.Code);
        error = await Assert.ThrowsAsync<AppException>(() => context.Queries.ListAsync(new() { Status = (ReservationStatus)99 }));
        Assert.Equal(ErrorCodes.InvalidRequest, error.Code);
    }
}
