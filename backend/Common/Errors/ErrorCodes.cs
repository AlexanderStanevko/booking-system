namespace MeetingRooms.Api.Common.Errors;

public static class ErrorCodes
{
    public const string InvalidRequest = "INVALID_REQUEST";
    public const string InvalidTimeRange = "INVALID_TIME_RANGE";
    public const string StartTimeNotInFuture = "START_TIME_NOT_IN_FUTURE";
    public const string MaxDurationExceeded = "MAX_DURATION_EXCEEDED";
    public const string BookingHorizonExceeded = "BOOKING_HORIZON_EXCEEDED";
    public const string RoomAlreadyBooked = "ROOM_ALREADY_BOOKED";
    public const string OrganizerAlreadyBooked = "ORGANIZER_ALREADY_BOOKED";
    public const string RoomCapacityExceeded = "ROOM_CAPACITY_EXCEEDED";
    public const string InvalidAttendeeCount = "INVALID_ATTENDEE_COUNT";
    public const string RoomInactive = "ROOM_INACTIVE";
    public const string RoomNotFound = "ROOM_NOT_FOUND";
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string ReservationNotFound = "RESERVATION_NOT_FOUND";
    public const string InvalidReservationStatus = "INVALID_RESERVATION_STATUS";
    public const string EndpointNotFound = "ENDPOINT_NOT_FOUND";
    public const string UnexpectedError = "UNEXPECTED_ERROR";
}
