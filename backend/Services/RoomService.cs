using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Mappings;
using MeetingRooms.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MeetingRooms.Api.Services;

public sealed class RoomService(ApplicationDbContext database)
{
    public async Task<IReadOnlyList<RoomResponse>> ListAsync(
        RoomFilter filter, CancellationToken cancellationToken = default)
    {
        const Equipment allEquipment = Equipment.Projector | Equipment.TvScreen
            | Equipment.VideoConferencing | Equipment.Whiteboard;
        if (filter.MinCapacity <= 0 || (filter.Equipment.HasValue && (filter.Equipment.Value & ~allEquipment) != 0))
        {
            throw new AppException(ErrorCodes.InvalidRequest, "The room filters are invalid.");
        }

        var query = database.Rooms.AsNoTracking();
        if (filter.MinCapacity.HasValue)
        {
            query = query.Where(room => room.Capacity >= filter.MinCapacity);
        }

        if (filter.Equipment.HasValue)
        {
            query = query.Where(room => (room.Equipment & filter.Equipment.Value) == filter.Equipment.Value);
        }

        if (filter.Floor.HasValue)
        {
            query = query.Where(room => room.Floor == filter.Floor);
        }

        var rooms = await query.OrderBy(room => room.Name).ToListAsync(cancellationToken);
        return rooms.Select(room => room.ToResponse()).ToList();
    }

    public async Task<RoomResponse> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var room = await database.Rooms.AsNoTracking().SingleOrDefaultAsync(room => room.Id == id, cancellationToken)
            ?? throw new AppException(ErrorCodes.RoomNotFound, "The requested room does not exist.", StatusCodes.Status404NotFound);
        return room.ToResponse();
    }
}
