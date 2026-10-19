using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Configuration;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MeetingRooms.Api.Services.Reservations;

public sealed class ReservationValidator(
    ApplicationDbContext database, IOptions<BookingOptions> options, ReservationConflictChecker conflicts)
{
    public async Task<(Room Room, User Organizer)> ValidateAsync(
        Reservation reservation, DateTimeOffset now, CancellationToken cancellationToken = default)
    {
        ValidateTimeRange(reservation, now);
        ValidateDuration(reservation);
        ValidateHorizon(reservation.StartTime, now);
        ValidateTitle(reservation.Title);

        var room = await database.Rooms.FindAsync([reservation.RoomId], cancellationToken)
            ?? throw new AppException(ErrorCodes.RoomNotFound, "The requested room does not exist.", StatusCodes.Status404NotFound);
        var organizer = await database.Users.FindAsync([reservation.OrganizerId], cancellationToken)
            ?? throw new AppException(ErrorCodes.UserNotFound, "The requested organizer does not exist.", StatusCodes.Status404NotFound);

        ValidateRoom(room);
        ValidateCapacity(reservation.AttendeeCount, room.Capacity);
        await conflicts.ValidateAsync(reservation, cancellationToken);
        return (room, organizer);
    }

    private static void ValidateTimeRange(Reservation reservation, DateTimeOffset now)
    {
        if (reservation.EndTime <= reservation.StartTime)
        {
            throw new AppException(ErrorCodes.InvalidTimeRange, "The end time must be later than the start time.");
        }

        if (reservation.StartTime <= now)
        {
            throw new AppException(ErrorCodes.StartTimeNotInFuture, "The reservation must start in the future.");
        }
    }

    private void ValidateDuration(Reservation reservation)
    {
        if ((reservation.EndTime - reservation.StartTime).TotalDays > options.Value.MaxDurationDays)
        {
            throw new AppException(ErrorCodes.MaxDurationExceeded,
                $"A reservation cannot last longer than {options.Value.MaxDurationDays} days.");
        }
    }

    private void ValidateHorizon(DateTimeOffset start, DateTimeOffset now)
    {
        if ((start - now).TotalDays > options.Value.MaxAdvanceBookingDays)
        {
            throw new AppException(ErrorCodes.BookingHorizonExceeded,
                $"A reservation cannot start more than {options.Value.MaxAdvanceBookingDays} days in the future.");
        }
    }

    private static void ValidateCapacity(int attendees, int capacity)
    {
        if (attendees <= 0)
        {
            throw new AppException(ErrorCodes.InvalidAttendeeCount, "The attendee count must be greater than zero.");
        }

        if (attendees > capacity)
        {
            throw new AppException(ErrorCodes.RoomCapacityExceeded, "The attendee count exceeds the room capacity.");
        }
    }

    private static void ValidateRoom(Room room)
    {
        if (!room.IsActive)
        {
            throw new AppException(ErrorCodes.RoomInactive, "This room is inactive and cannot be booked.");
        }
    }

    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title) || title.Length > 200)
        {
            throw new AppException(ErrorCodes.InvalidRequest, "The title must contain between 1 and 200 characters.");
        }
    }
}
