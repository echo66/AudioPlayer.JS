function IDevice() {}

IDevice.prototype.id = function() { throw "Not implemented"; }

IDevice.prototype.parameters = function() { throw "Not implemented"; }

IDevice.prototype.connect = function(fromPort, toPort) { throw "Not implemented"; }

IDevice.prototype.disconnect = function(port) { throw "Not implemented"; }

IDevice.prototype.get_sub_devices = function() { throw "Not implemented"; }

IDevice.prototype.get_parent_device = function() { throw "Not implemented"; }

IDevice.prototype.start = function() { throw "Not implemented"; }

IDevice.prototype.pause = function() { throw "Not implemented"; }

IDevice.prototype.stop = function() { throw "Not implemented"; }