using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRooms.Api.Controllers;

[ApiController]
[Route("api/users")]
public sealed class UsersController(UserService users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserResponse>>> List(CancellationToken cancellationToken)
        => Ok(await users.ListAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserResponse>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await users.GetAsync(id, cancellationToken));
}
