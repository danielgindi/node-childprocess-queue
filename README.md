# childprocess-queue

[![npm Version](https://badge.fury.io/js/childprocess-queue.png)](https://npmjs.org/package/childprocess-queue)

Use `childprocess` module freely while limiting the amount of concurrent processes

## Includes:

* Limit how many processes are running at the same time. Additional processes will be queued.
* Supports `fork`, `spawn`, `exec`, `execFile` with the usual signature, with exception of returning an *id* and not a `ChildProcess`.
* Add an `onCreate` callback to the `options` that you pass, to get a notification when the process was created. One argument will be passed back, containing the `ChildProcess` instance.
* Call `newQueue` to receive a separate queue that you can use like the main `ChildProcessQueue` object.
* Call `setMaxProcesses` to set the maximum concurrent processes.
* Call `getMaxProcesses` to get the maximum concurrent processes (defaults to 5).
* Call `getCurrentProcessCount` to get the number of currently running processes.
* Call `getCurrentProcesses` to get an array of the currently running processes.
* Call `getCurrentQueueSize` to get the number of processes waiting in the queue.
* Call `removeFromQueue` with an *id* to remove a pending process from the queue.

## Installation:

```
npm install --save childprocess-queue
```

## Contributing

If you have anything to contribute, or functionality that you lack - you are more than welcome to participate in this!
If anyone wishes to contribute unit tests - that also would be great :-)

## Me
* Hi! I am Daniel Cohen Gindi. Or in short- Daniel.
* danielgindi@gmail.com is my email address.
* That's all you need to know.

## Help

If you want to buy me a beer, you are very welcome to
[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=G6CELS3E997ZE)
 Thanks :-)

## License

All the code here is under MIT license. Which means you could do virtually anything with the code.
I will appreciate it very much if you keep an attribution where appropriate.

    The MIT License (MIT)

    Copyright (c) 2013 Daniel Cohen Gindi (danielgindi@gmail.com)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
