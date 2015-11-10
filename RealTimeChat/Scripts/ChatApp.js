$(function () {
    // Declare a proxy to reference the hub.
    var chat = $.connection.chatHub;

    registerClientMethods(chat);

    // Start the connection.
    $.connection.hub.start().done(function () {
        registerEvents(chat)
    });
});

function registerClientMethods(chat) {
    //Counts the number of users connected
    chat.client.online = function (count) {
        $("#onlineUsers").html(count);
    };

    $("#btnStartChat").click(function () {
        var name = $("#txtNickName").val();
        if (name.length > 0) {
            chat.server.connect(name);
            $('.chat_box').show('fast');
            $('.msg_box').show('fast');
            $('.login').dialog('close');
        }
        else {
            alert("Please enter name");
        }
    });

    // Calls when user successfully logged in
    chat.client.onConnected = function (id, userName, allUsers, messages) {
        $('#userId').val(id);
        $('#userName').val(userName);

        //Add username to msg_head
        $('.msg_head').prepend($('#userName').val());

        // Add All Users
        for (i = 0; i < allUsers.length; i++) {
            AddUser(chat, allUsers[i].ConnectionId, allUsers[i].UserName);
        }

        // Add Existing Messages
        for (i = 0; i < messages.length; i++) {
            AddMessage(messages[i].UserName, messages[i].Message);
        }

        // Set initial focus to message input box.
        $('.msg_input').focus();
    }

    // On User Disconnected
    chat.client.onUserDisconnected = function (id, userName) {

        $('#' + id).remove();

        var ctrId = 'private_' + id;
        $('#' + ctrId).remove();

        var disc = $('<div class="disconnect">"' + userName + '" logged off.</div>');

        $(disc).hide();
        $('.chat_body').prepend(disc);
        $(disc).fadeIn(200).delay(2000).fadeOut(200);
    }

    // On New User Connected
    chat.client.onNewUserConnected = function (id, name) {
        AddUser(chat, id, name);
    }

    function AddMessage(userName, message) {
        $('.msg_body').append('<div class="msg_a">' + userName + ':&nbsp;&nbsp;' + message + '</div>');
        var height = $('.msg_body')[0].scrollHeight;
        $('.msg_body').scrollTop(height);
    }

    //The hub uses this function to broadcast messages.
    chat.client.broadcastMessage = function (name, message) {
        // Html encode display name and message.
        var encodedName = $('<div />').text(name).html();
        var encodedMsg = $('<div />').text(message).html();

        // Add the message to the page.
        //The user's own messages use div msg_b
        if (encodedName == ($('#userName').val())) {
            $('.msg_body').append('<div class="msg_b">' + encodedName
                + ':&nbsp;&nbsp;' + encodedMsg + '</div>');
        }
            //Messages from other users use div msg_a
        else {
            $('.msg_body').append('<div class="msg_a">' + encodedName
                + ':&nbsp;&nbsp;' + encodedMsg + '</div>');
        }
        $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
    };
}

function registerEvents(chat) {
    $('textarea').keypress(
    function (e) {
        if (e.keyCode == 13) {
            var msg = $(this).val();
            $(this).val('');
            if (msg != '') {
                // Call the Send method on the hub.
                chat.server.send($('#userName').val(), msg);

                // Clear text box and reset focus for next comment.
                $('.msg_input').val('').focus();
            }
        }
    });
}

function AddUser(chat, id, name) {
    var userId = $('#userId').val();
    var code = "";
    if (userId == id) {
        code = $('<div id="' + id + '" class="user" >' + name + '</div>');
        $(code).dblclick(function () {
            var id = $(this).attr('id');
            if (userId == id) {
                $('.msg_wrap').show();
                $('.msg_box').show();
            }
        });
    }
    else {
        code = $('<div id="' + id + '" class="user" >' + name + '</div>');
        $(code).dblclick(function () {
            var id = $(this).attr('id');
            if (userId != id) {
                alert('open Private Chat Window');
                //OpenPrivateChatWindow(chatHub, id, name);
            }
        });
    }
    $(".chat_body").append(code);
}

window.onload = function () {
    $('.login').dialog({
        title: 'Login',
        width: 430,
        height: 250,
        buttons: {
            Close:
                function () {
                    $(this).dialog('close');
                }
        }
    });
}