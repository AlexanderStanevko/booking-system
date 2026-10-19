using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Tests;

public sealed class ReservationEditingTests
{
    [Fact]
    public async Task New_reservations_start_booked_without_actual_end()
    {
        await using var context = new BookingTestContext();
        var result = await context.Reservations.CreateAsync(context.ValidRequest);
        Assert.Equal(ReservationStatus.Booked, result.Status);
        Assert.Null(result.ActualEndTime);
    }

    [Fact]
    public async Task Upcoming_reservation_can_change_all_editable_fields()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        var request = context.UpdateRequest with
        {
            RoomId = context.SecondRoom.Id,
            OrganizerId = context.SecondUser.Id,
            Title = "Updated title",
            StartTime = existing.StartTime.AddDays(1),
            EndTime = existing.EndTime.AddDays(1),
            AttendeeCount = 12
        };
        var result = await context.Reservations.UpdateAsync(existing.Id, request);
        Assert.Equal(request.RoomId, result.RoomId);
        Assert.Equal(context.SecondRoom.Name, result.RoomName);
        Assert.Equal(request.OrganizerId, result.OrganizerId);
        Assert.Equal(request.Title, result.Title);
        Assert.Equal(request.StartTime, result.StartTime);
        Assert.Equal(request.EndTime, result.EndTime);
        Assert.Equal(request.AttendeeCount, result.AttendeeCount);
        Assert.Null(result.ActualEndTime);
    }

    [Theory]
    [InlineData("duration", ErrorCodes.MaxDurationExceeded)]
    [InlineData("start", ErrorCodes.StartTimeNotInFuture)]
    [InlineData("range", ErrorCodes.InvalidTimeRange)]
    [InlineData("capacity", ErrorCodes.RoomCapacityExceeded)]
    [InlineData("horizon", ErrorCodes.BookingHorizonExceeded)]
    [InlineData("inactive", ErrorCodes.RoomInactive)]
    public async Task Editing_revalidates_booking_rules_without_persisting_invalid_changes(string rule, string code)
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        var originalStart = existing.StartTime;
        var originalEnd = existing.EndTime;
        var request = rule switch
        {
            "duration" => context.UpdateRequest with { EndTime = originalStart.AddDays(8) },
            "start" => context.UpdateRequest with { StartTime = context.Clock.GetUtcNow() },
            "range" => context.UpdateRequest with { EndTime = originalStart },
            "capacity" => context.UpdateRequest with { AttendeeCount = 11 },
            "horizon" => context.UpdateRequest with
            {
                StartTime = context.Clock.GetUtcNow().AddDays(91),
                EndTime = context.Clock.GetUtcNow().AddDays(92)
            },
            _ => context.UpdateRequest with { RoomId = context.InactiveRoom.Id }
        };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.UpdateAsync(existing.Id, request));
        Assert.Equal(code, error.Code);
        Assert.Equal(originalStart, existing.StartTime);
        Assert.Equal(originalEnd, existing.EndTime);
        Assert.Equal(context.FirstRoom.Id, existing.RoomId);
    }

    [Theory]
    [InlineData(true, ErrorCodes.RoomAlreadyBooked)]
    [InlineData(false, ErrorCodes.OrganizerAlreadyBooked)]
    public async Task Editing_rechecks_conflicts(bool sameRoom, string code)
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        await context.AddReservationAsync(reservation =>
        {
            reservation.RoomId = context.SecondRoom.Id;
            reservation.OrganizerId = context.SecondUser.Id;
        });
        var request = sameRoom
            ? context.UpdateRequest with { RoomId = context.SecondRoom.Id }
            : context.UpdateRequest with { OrganizerId = context.SecondUser.Id };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.UpdateAsync(existing.Id, request));
        Assert.Equal(code, error.Code);
    }

    [Theory]
    [InlineData(ReservationStatus.Cancelled)]
    [InlineData(ReservationStatus.Completed)]
    public async Task Cancelled_and_completed_reservations_cannot_be_edited(ReservationStatus status)
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync(reservation =>
        {
            reservation.Status = status;
            if (status == ReservationStatus.Completed)
            {
                reservation.StartTime = context.Clock.GetUtcNow().AddHours(-2);
                reservation.EndTime = context.Clock.GetUtcNow().AddHours(-1);
            }
        });
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.UpdateAsync(existing.Id, context.UpdateRequest));
        Assert.Equal(ErrorCodes.InvalidReservationStatus, error.Code);
    }

    [Fact]
    public async Task An_ongoing_reservation_cannot_be_edited()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = context.Clock.GetUtcNow();
            reservation.EndTime = context.Clock.GetUtcNow().AddHours(1);
        });
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.UpdateAsync(existing.Id, context.UpdateRequest));
        Assert.Equal(ErrorCodes.InvalidReservationStatus, error.Code);
    }
}
