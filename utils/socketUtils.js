const connectedUsers = {};

module.exports = {
  getConnectedUsers: () => connectedUsers,
  setConnectedUsers: (newConnectedUsers) => {
    connectedUsers = newConnectedUsers;
  },
};
