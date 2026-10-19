namespace MeetingRooms.Api.Models;

public sealed class Room
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int Capacity { get; set; }
    public int Floor { get; set; }
    public required string Location { get; set; }
    public Equipment Equipment { get; set; }
    public bool IsActive { get; set; }
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
