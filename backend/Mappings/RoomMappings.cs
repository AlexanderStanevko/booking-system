using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Mappings;

public static class RoomMappings
{
    public static RoomResponse ToResponse(this Room room)
        => new(room.Id, room.Name, room.Capacity, room.Floor, room.Location, room.Equipment, room.IsActive);
}
