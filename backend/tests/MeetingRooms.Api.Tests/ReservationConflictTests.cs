using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Models;
using Microsoft.AspNetCore.Http;

namespace MeetingRooms.Api.Tests;

public sealed class ReservationConflictTests
{
    [Theory]
    [InlineData(-30, 60)]
    [InlineData(30, 60)]
    [InlineData(15, 15)]
    [InlineData(-30, 120)]
    public async Task Room_conflicts_detect_partial_contained_and_enclosing_intervals(int offsetMinutes, int durationMinutes)
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        var start = existing.StartTime.AddMinutes(offsetMinutes);
        var request = context.ValidRequest with
        {
            StartTime = start,
            EndTime = start.AddMinutes(durationMinutes),
            OrganizerId = context.SecondUser.Id
        };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.RoomAlreadyBooked, error.Code);
        Assert.Equal(StatusCodes.Status409Conflict, error.StatusCode);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Adjacent_bookings_for_same_room_and_organizer_are_allowed(bool after)
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        var start = after ? existing.EndTime : existing.StartTime.AddHours(-1);
        var result = await context.Reservations.CreateAsync(context.ValidRequest with
        {
            StartTime = start,
            EndTime = start.AddHours(1)
        });
        Assert.Equal(ReservationStatus.Booked, result.Status);
    }

    [Fact]
    public async Task Cancelled_reservations_do_not_block_room_or_organizer()
    {
        await using var context = new BookingTestContext();
        await context.AddReservationAsync(reservation => reservation.Status = ReservationStatus.Cancelled);
        Assert.NotNull(await context.Reservations.CreateAsync(context.ValidRequest));
    }

    [Fact]
    public async Task Different_rooms_and_organizers_can_overlap()
    {
        await using var context = new BookingTestContext();
        await context.AddReservationAsync();
        var request = context.ValidRequest with { RoomId = context.SecondRoom.Id, OrganizerId = context.SecondUser.Id };
        Assert.NotNull(await context.Reservations.CreateAsync(request));
    }

    [Fact]
    public async Task Organizer_cannot_overlap_in_different_rooms()
    {
        await using var context = new BookingTestContext();
        await context.AddReservationAsync();
        var request = context.ValidRequest with { RoomId = context.SecondRoom.Id };
        var error = await Assert.ThrowsAsync<AppException>(() => context.Reservations.CreateAsync(request));
        Assert.Equal(ErrorCodes.OrganizerAlreadyBooked, error.Code);
    }

    [Fact]
    public async Task Editing_excludes_its_own_reservation()
    {
        await using var context = new BookingTestContext();
        var existing = await context.AddReservationAsync();
        var result = await context.Reservations.UpdateAsync(existing.Id, context.UpdateRequest);
        Assert.Equal(existing.Id, result.Id);
    }

    [Fact]
    public async Task Early_completion_frees_the_remaining_scheduled_interval()
    {
        await using var context = new BookingTestContext();
        var now = context.Clock.GetUtcNow();
        await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = now.AddHours(-1);
            reservation.EndTime = now.AddHours(2);
            reservation.ActualEndTime = now;
            reservation.Status = ReservationStatus.Completed;
        });
        Assert.NotNull(await context.Reservations.CreateAsync(context.ValidRequest with
        {
            StartTime = now.AddMinutes(10),
            EndTime = now.AddHours(1)
        }));
    }
}
