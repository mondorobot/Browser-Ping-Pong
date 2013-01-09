//
//  WebSocketHandler.h
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/18/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __MondoRobot_iOSWebSocketsController__WebSocketHandler__
#define __MondoRobot_iOSWebSocketsController__WebSocketHandler__

#include <iostream>

#include <boost/shared_ptr.hpp>

#include "websocketpp.hpp"

namespace mr
{
    class WebSocketHandler : public websocketpp::server::handler
    {
    private:
        websocketpp::server::connection_ptr con_;
        void *delegate_;
        
    public:

        WebSocketHandler();
        virtual ~WebSocketHandler();
        
        void setDelegate(void *delegate) { delegate_ = delegate; }
        void *getDelegate() { return delegate_; }
        void on_fail(websocketpp::server::connection_ptr con);
        void on_open(websocketpp::server::connection_ptr con);
        void on_close(websocketpp::server::connection_ptr con);
        void on_message(websocketpp::server::connection_ptr con, websocketpp::server::handler::message_ptr msg);
        void send(const std::string &msg);
        void send(const char *data, std::size_t size);
        void send(const std::string &msg, websocketpp::frame::opcode::value op);
        void close();
    };
    
    typedef boost::shared_ptr<WebSocketHandler> WebSocketHandlerPtr;
}

#endif /* defined(__MondoRobot_iOSWebSocketsController__WebSocketHandler__) */
