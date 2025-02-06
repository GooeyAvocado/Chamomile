using Microsoft.AspNetCore.SignalR;

namespace Chamomile.API.Hubs {
    public class ImageGenerateHub : Hub {
        public async Task Subscribe() {
            await Clients.Caller.SendAsync("ReceiveMessage","Connected to Image Generation Updates");
        }
    }
}
