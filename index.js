const { Component, Module } = require('koach')
const SocketIO = require('socket.io')
const IONamespace = require('./io')

module.exports = class Socket extends Component {

  constructor (config, context) {
    super(config, context)
  }

  componentWillMount () {
    const { context: app } = this
    const server = app.server

    if (server.http && server.http.constructor.name != 'Server') {
      throw new Error('app.server already exists but it\'s not an http server');
    }

    if (!app._ioServer) {
      app._ioServer = new SocketIO(server.http, this.config.io)
    }

    // Attach default namespace
    // app.io = new IONamespace(app._ioServer, this.config.path)//this.config.get('namespace'))

    app.attach('io', () => new IONamespace(app._ioServer, this.config.path))
    // app.io.of = function (nsp) {
    //   return new Namespace(app._ioServer, nsp)
    // }

    // const mount = function () {
    //   app.io.listen(Socket.PORT)
    //   app.removeListener('listening', boot)
    // }
    // app.on('listen', mount)

    this.ioServer = app._ioServer
  }

  compose () {
    return Module.spec()
      .use(this.config.subcomponents)
  }

}
