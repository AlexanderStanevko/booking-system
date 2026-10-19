using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRooms.Api.Controllers;

[ApiController]
[Route("api/reports")]
public sealed class ReportsController(RoomUsageService reports) : ControllerBase
{
    [HttpGet("room-usage")]
    public async Task<ActionResult<IReadOnlyList<RoomUsageResponse>>> RoomUsage(
        [FromQuery] DateRangeFilter filter, CancellationToken cancellationToken)
        => Ok(await reports.GetAsync(filter, cancellationToken));
}
