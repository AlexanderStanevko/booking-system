using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.DTOs;

public sealed record RoomResponse(
    Guid Id, string Name, int Capacity, int Floor, string Location, Equipment Equipment, bool IsActive);
