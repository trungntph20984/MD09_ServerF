const socketIO = require('socket.io');

function setupSocket(server) {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('Người dùng kết nối:', socket.id);

        socket.on('message', (data) => {
            console.log('Received message:', data);

            if (data && data.recipientId) {
                io.to(data.recipientId).emit('message', {
                    recipientId: data.recipientId,
                    text: data.message,
                    createdAt: data.createdAt,
                    _id: data._id,
                    sender: data.sender,
                    conversationId: data.conversationId
                });
            } else {
                io.emit('message', { text: data.message, createdAt: data.createdAt });
            }
        });


        socket.on('disconnect', () => {
            console.log('Người dùng ngắt kết nối:', socket.id);
        });
    });
}

module.exports = setupSocket;
