using MeetingRooms.Api.DTOs;
using MeetingRooms.Api.Services.Reservations;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRooms.Api.Controllers;

[ApiController]
[Route("api/reservations")]
public sealed class ReservationsController(
    ReservationService reservations, ReservationQueryService queries) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReservationResponse>>> List(
        [FromQuery] ReservationFilter filter, CancellationToken cancellationToken)
        => Ok(await queries.ListAsync(filter, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReservationResponse>> Get(Guid id, CancellationToken cancellationToken)
        => Ok(await queries.GetAsync(id, cancellationToken));

    [HttpPost]
    public async Task<ActionResult<ReservationResponse>> Create(
        CreateReservationRequest request, CancellationToken cancellationToken)
    {
        var result = await reservations.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ReservationResponse>> Update(
        Guid id, UpdateReservationRequest request, CancellationToken cancellationToken)
        => Ok(await reservations.UpdateAsync(id, request, cancellationToken));

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ReservationResponse>> Cancel(Guid id, CancellationToken cancellationToken)
        => Ok(await reservations.CancelAsync(id, cancellationToken));

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<ReservationResponse>> Complete(Guid id, CancellationToken cancellationToken)
        => Ok(await reservations.CompleteAsync(id, cancellationToken));
}
