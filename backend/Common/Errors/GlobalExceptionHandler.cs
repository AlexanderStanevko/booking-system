using Microsoft.AspNetCore.Diagnostics;

namespace MeetingRooms.Api.Common.Errors;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var error = exception as AppException;
        var badRequest = exception as BadHttpRequestException;
        context.Response.StatusCode = error?.StatusCode
            ?? badRequest?.StatusCode ?? StatusCodes.Status500InternalServerError;

        if (error is null && badRequest is null)
        {
            logger.LogError(exception, "An unexpected API error occurred.");
        }

        var response = error is not null
            ? new ApiErrorResponse(error.Code, error.Message)
            : new ApiErrorResponse(
                badRequest is not null ? ErrorCodes.InvalidRequest : ErrorCodes.UnexpectedError,
                badRequest is not null ? "The request is invalid." : "An unexpected server error occurred.");

        await context.Response.WriteAsJsonAsync(response, cancellationToken);
        return true;
    }
}
