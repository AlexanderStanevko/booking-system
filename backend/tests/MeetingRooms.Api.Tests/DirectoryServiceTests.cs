using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Tests;

public sealed class DirectoryServiceTests
{
    [Fact]
    public async Task Room_filters_require_all_equipment_and_can_be_combined()
    {
        await using var context = new BookingTestContext();
        var result = await context.Rooms.ListAsync(new()
        {
            MinCapacity = 10,
            Floor = 1,
            Equipment = Equipment.Projector | Equipment.Whiteboard
        });
        Assert.Equal(context.FirstRoom.Id, Assert.Single(result).Id);
        Assert.Empty(await context.Rooms.ListAsync(new() { Equipment = Equipment.Projector | Equipment.TvScreen }));
        Assert.False((await context.Rooms.GetAsync(context.InactiveRoom.Id)).IsActive);
        Assert.Equal(3, (await context.Rooms.ListAsync(new())).Count);
    }

    [Fact]
    public async Task Unknown_equipment_flags_are_rejected()
    {
        await using var context = new BookingTestContext();
        var error = await Assert.ThrowsAsync<AppException>(() => context.Rooms.ListAsync(new() { Equipment = (Equipment)16 }));
        Assert.Equal(ErrorCodes.InvalidRequest, error.Code);
    }

    [Fact]
    public async Task User_counts_only_upcoming_and_ongoing_bookings()
    {
        await using var context = new BookingTestContext();
        var now = context.Clock.GetUtcNow();
        await context.AddReservationAsync();
        await context.AddReservationAsync(reservation =>
        {
            reservation.RoomId = context.SecondRoom.Id;
            reservation.StartTime = now.AddMinutes(-30);
            reservation.EndTime = now.AddMinutes(30);
        });
        await context.AddReservationAsync(reservation => reservation.Status = ReservationStatus.Cancelled);
        await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = now.AddHours(-2);
            reservation.EndTime = now.AddHours(-1);
        });
        await context.AddReservationAsync(reservation =>
        {
            reservation.StartTime = now.AddHours(-4);
            reservation.EndTime = now.AddHours(-3);
            reservation.ActualEndTime = now.AddHours(-3.5);
            reservation.Status = ReservationStatus.Completed;
        });
        Assert.Equal(2, (await context.Users.GetAsync(context.FirstUser.Id)).ActiveReservationCount);
        var users = await context.Users.ListAsync();
        Assert.Equal(2, users.Single(user => user.Id == context.FirstUser.Id).ActiveReservationCount);
        Assert.Equal(0, users.Single(user => user.Id == context.SecondUser.Id).ActiveReservationCount);
    }

    [Fact]
    public async Task Missing_rooms_and_users_return_distinct_codes()
    {
        await using var context = new BookingTestContext();
        var roomError = await Assert.ThrowsAsync<AppException>(() => context.Rooms.GetAsync(Guid.NewGuid()));
        var userError = await Assert.ThrowsAsync<AppException>(() => context.Users.GetAsync(Guid.NewGuid()));
        Assert.Equal(ErrorCodes.RoomNotFound, roomError.Code);
        Assert.Equal(ErrorCodes.UserNotFound, userError.Code);
    }
}
