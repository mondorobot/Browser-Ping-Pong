//
//  WebSocketServer.h
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/18/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __MondoRobot_iOSWebSocketsController__WebSocketServer__
#define __MondoRobot_iOSWebSocketsController__WebSocketServer__

#include <iostream>

#include <boost/shared_ptr.hpp>

#include "roles/client.hpp"
#include "websocketpp.hpp"
#include "WebSocketHandler.h"

#define PORT 7001

namespace mr
{
    class WebSocketServer
    {
    private:
        mr::WebSocketHandlerPtr _handler;
        boost::shared_ptr<websocketpp::server> _server;
        
    public:
        
        WebSocketServer() : _handler(new mr::WebSocketHandler())
        {
            _server = boost::shared_ptr<websocketpp::server>(new websocketpp::server(_handler));
            
            _server->alog().unset_level(websocketpp::log::alevel::ALL);
            _server->elog().unset_level(websocketpp::log::elevel::ALL);
            
            _server->alog().set_level(websocketpp::log::alevel::ALL);
            _server->elog().set_level(websocketpp::log::elevel::ALL);
        }
        
        virtual ~WebSocketServer()
        {
            _handler.reset();
            _server.reset();
        }
        
        void setDelegate(void *delegate) { _handler->setDelegate(delegate); }
        void *getDelegate() { return _handler->getDelegate(); }
        
        void start()
        {
            try
            {
                new boost::thread(boost::bind(&mr::WebSocketServer::start_thread,this));
            }
            catch (std::exception& e)
            {
                std::cerr << "Exception: " << e.what() << std::endl;
            }
        }
    
        void stop()
        {
            try
            {
                //_handler->close();
                _server->stop_listen(true);
            }
            catch (std::exception& e)
            {
                std::cerr << "Exception: " << e.what() << std::endl;
            }
        }
        
        void send(const char *data, std::size_t size)
        {
            _handler->send(data, size);
        }
        
    private:
        
        void start_thread()
        {
            std::cout << "Starting WebSocket server on port." << PORT << std::endl;
            
            _server->listen(PORT);
            
            std::cout << "WebSocket server on port completed." << PORT << std::endl;
        }
    };
    
    typedef boost::shared_ptr<WebSocketServer> WebSocketServerPtr;
}

#endif /* defined(__MondoRobot_iOSWebSocketsController__WebSocketServer__) */
