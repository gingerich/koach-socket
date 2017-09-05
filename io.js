const EventEmitter = require('events')

class IO extends EventEmitter {
  
  /**
   * @param io <Socket.io Instance>
   * @param path <String> namespace
   */
  constructor (io, path) {
    super()
    this._io = io
    this.sockets = typeof path === 'string' ? io.of(path) : io.sockets
    this.sockets.on('connection', this.onConnection.bind(this))

    ;['name', 'connected'].forEach(prop => Object.defineProperty(this, prop, {
      get () { return this.sockets[prop] },
      enumerable: true
    }))
  }

  of (path) {
    return new IO(this._io, path)
  }

  use (fn) {
    this.sockets.use(fn)
    return this
  }

  on (event, handler, once=false) {
    super.on(event, handler)
    this.use((socket, next) => {
      const ioFn = once ? 'once' : 'on'
      socket[ioFn](event, this.emit.bind(this, event, socket))
      next()
    })
    return () => this.removeListener(event, handler) //this.off.bind(this, event, handler)
  }

  once (event, handler) {
    return this.on(event, handler, true)
  }

  off (event, handler) {
    if (handler) {
      this.removeListener(event, handler)
    } else {
      this.removeAllListeners(event)
    }
  }

  onConnection (socket) {
    this.emit('connection', socket) // if socket emits 'connection' event then this is redundant
    socket.on('disconnect', this.onDisconnect.bind(this, socket))
  }

  onDisconnect (socket) {
    this.eventNames().forEach(eventName => this.removeAllListeners(eventName))
  }

}

module.exports = IO
