using System.Text.Json;
using MeetingRooms.Api.Common.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace MeetingRooms.Api.Tests;

public sealed class ErrorHandlingTests
{
    [Fact]
    public async Task Application_errors_preserve_their_code_message_and_http_status()
    {
        var exception = new AppException(ErrorCodes.RoomAlreadyBooked, "The room is already booked.", StatusCodes.Status409Conflict);
        var (status, error) = await HandleAsync(exception);
        Assert.Equal(StatusCodes.Status409Conflict, status);
        Assert.Equal(exception.Code, error.Code);
        Assert.Equal(exception.Message, error.Message);
    }

    [Fact]
    public async Task Unexpected_errors_return_a_safe_structured_server_error()
    {
        var (status, error) = await HandleAsync(new InvalidOperationException("Internal database details"));
        Assert.Equal(StatusCodes.Status500InternalServerError, status);
        Assert.Equal(ErrorCodes.UnexpectedError, error.Code);
        Assert.DoesNotContain("database", error.Message);
    }

    private static async Task<(int Status, ApiErrorResponse Error)> HandleAsync(Exception exception)
    {
        await using var services = new ServiceCollection().AddOptions().BuildServiceProvider();
        var context = new DefaultHttpContext { RequestServices = services };
        await using var body = new MemoryStream();
        context.Response.Body = body;
        var handler = new GlobalExceptionHandler(NullLogger<GlobalExceptionHandler>.Instance);
        Assert.True(await handler.TryHandleAsync(context, exception, CancellationToken.None));
        body.Position = 0;
        var error = await JsonSerializer.DeserializeAsync<ApiErrorResponse>(body, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        return (context.Response.StatusCode, error!);
    }
}
