using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(RealTimeChat.Startup))]// SignalRChat.Startup))]
namespace RealTimeChat
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //Any connection or hub wire up and configuration should go here
            app.MapSignalR();
        }
    }
}