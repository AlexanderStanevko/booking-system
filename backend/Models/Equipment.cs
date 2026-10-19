namespace MeetingRooms.Api.Models;

[Flags]
public enum Equipment
{
    None = 0,
    Projector = 1,
    TvScreen = 2,
    VideoConferencing = 4,
    Whiteboard = 8
}
