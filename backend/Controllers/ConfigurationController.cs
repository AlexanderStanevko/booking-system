using MeetingRooms.Api.Configuration;
using MeetingRooms.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace MeetingRooms.Api.Controllers;

[ApiController]
[Route("api/configuration/booking")]
public sealed class ConfigurationController(IOptions<BookingOptions> options) : ControllerBase
{
    [HttpGet]
    public ActionResult<BookingConfigurationResponse> Get()
        => Ok(new BookingConfigurationResponse(options.Value.MaxDurationDays, options.Value.MaxAdvanceBookingDays));
}
