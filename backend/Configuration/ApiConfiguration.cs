using System.Text.Json.Serialization;
using MeetingRooms.Api.Common.Errors;
using MeetingRooms.Api.Common.Time;
using MeetingRooms.Api.Data;
using MeetingRooms.Api.Services;
using MeetingRooms.Api.Services.Reservations;
using Microsoft.AspNetCore.Mvc;

namespace MeetingRooms.Api.Configuration;

public static class ApiConfiguration
{
    public static IServiceCollection AddMeetingRoomServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: false));
            options.JsonSerializerOptions.Converters.Add(new UtcTimestampJsonConverter());
            options.JsonSerializerOptions.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow;
        }).ConfigureApiBehaviorOptions(options =>
        {
            options.SuppressMapClientErrors = true;
            options.InvalidModelStateResponseFactory = _ => new BadRequestObjectResult(
                new ApiErrorResponse(ErrorCodes.InvalidRequest, "The request contains invalid or missing values."));
        });

        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();
        services.AddOptions<BookingOptions>().Bind(configuration.GetSection("Booking"))
            .ValidateDataAnnotations().ValidateOnStart();
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<ReservationLock>();
        services.AddScoped<RoomService>();
        services.AddScoped<UserService>();
        services.AddScoped<RoomUsageService>();
        services.AddScoped<ReservationService>();
        services.AddScoped<ReservationQueryService>();
        services.AddScoped<ReservationValidator>();
        services.AddScoped<ReservationConflictChecker>();
        services.AddScoped<ReservationCompletion>();
        services.AddScoped<DatabaseSeeder>();
        services.AddHostedService<ReservationCompletionWorker>();
        return services;
    }
}
