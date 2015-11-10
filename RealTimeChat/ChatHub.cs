using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace RealTimeChat
{
    public class ChatHub : Hub
    {
        private static List<UserDetail> ConnectedUsers = new List<UserDetail>();
        private static List<MessageDetail> CurrentMessage = new List<MessageDetail> ();

        public void Connect(string userName)
        {
            var id = Context.ConnectionId;
            if (ConnectedUsers.Count(x => x.ConnectionId == id) == 0)
            {
                ConnectedUsers.Add(new UserDetail { ConnectionId = id, UserName = userName });
                
                // send to caller
                Clients.Caller.onConnected(id, userName, ConnectedUsers, CurrentMessage);
                
                // send to all except caller client
                Clients.AllExcept(id).onNewUserConnected(id, userName);
            }
        }

        public void Send(string name, string message)
        {
            // Store last 100 messages in cache
            AddMessageinCache(name, message);

            //Call the broadcastMessage method to update clients
            Clients.All.broadcastMessage(name, message);
        }

        private void AddMessageinCache(string userName, string message)
        {
            CurrentMessage.Add(new MessageDetail { UserName = userName, Message = message });

            if (CurrentMessage.Count > 100)
                CurrentMessage.RemoveAt(0);
        }

        public override Task OnConnected()
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<ChatHub>();
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            var item = ConnectedUsers.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            if (item != null)
            {
                ConnectedUsers.Remove(item);
                var id = Context.ConnectionId;
                Clients.All.onUserDisconnected(id, item.UserName);
            }
            var context = GlobalHost.ConnectionManager.GetHubContext<ChatHub>();
            return base.OnDisconnected(stopCalled);
        }
    }
}