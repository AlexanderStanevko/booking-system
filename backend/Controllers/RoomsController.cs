using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRooms.Api.Controllers;

[ApiController]
[Route("api/rooms")]
public sealed class RoomsController(RoomService rooms) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RoomResponse>>> List(
        [FromQuery] RoomFilter filter, CancellationToken cancellationToken)
        => Ok(await rooms.ListAsync(filter, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RoomResponse>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await rooms.GetAsync(id, cancellationToken));
}
