using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Models;

namespace MeetingRooms.Api.Mappings;

public static class UserMappings
{
    public static UserResponse ToResponse(this User user, int activeReservationCount)
        => new(user.Id, user.FirstName, user.LastName, activeReservationCount);
}
