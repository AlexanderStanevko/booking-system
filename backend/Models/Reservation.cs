namespace MeetingRooms.Api.Models;

public sealed class Reservation
{
    public Guid Id { get; set; }
    public Guid RoomId { get; set; }
    public Guid OrganizerId { get; set; }
    public required string Title { get; set; }
    public DateTimeOffset StartTime { get; set; }
    public DateTimeOffset EndTime { get; set; }
    public int AttendeeCount { get; set; }
    public ReservationStatus Status { get; set; }
    public DateTimeOffset? ActualEndTime { get; set; }
    public Room Room { get; set; } = null!;
    public User Organizer { get; set; } = null!;
}
