using MeetingRooms.Api.Configuration;
using MeetingRooms.Api.Controllers;
using MeetingRooms.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace MeetingRooms.Api.Tests;

public sealed class BookingConfigurationTests
{
    [Fact]
    public void Response_uses_configured_booking_limits()
    {
        var controller = new ConfigurationController(Options.Create(new BookingOptions
        {
            MaxDurationDays = 3,
            MaxAdvanceBookingDays = 21
        }));

        var result = Assert.IsType<OkObjectResult>(controller.Get().Result);
        var response = Assert.IsType<BookingConfigurationResponse>(result.Value);
        Assert.Equal(3, response.MaxDurationDays);
        Assert.Equal(21, response.MaxAdvanceBookingDays);
    }
}
