//
//  WebSocketHandler.cpp
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/18/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#include "WebSocketHandler.h"
#include "MrRootViewController.h"

namespace mr
{
    WebSocketHandler::WebSocketHandler()
    {
        delegate_ = 0;
    }

    WebSocketHandler::~WebSocketHandler()
    {
        std::cout << "~WebSocketHandler" << std::endl;
    }

    void WebSocketHandler::on_fail(websocketpp::server::connection_ptr con)
    {
        std::cout << ">>>>>>>>>>>>>>>>>>>>>>>>>>>>> WebSocket connection failed <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" << std::endl;
        
        if(delegate_)
            [(NSObject<MrViewControllerProtocol> *)delegate_ performSelectorOnMainThread:@selector(connectionFailed) withObject:nil waitUntilDone:NO];
    }

    void WebSocketHandler::on_open(websocketpp::server::connection_ptr con)
    {
        con_ = con;
        std::cout << ">>>>>>>>>>>>>>>>>>>>>>>>>>>>> WebSocket connection established <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<" << std::endl;
        
        if(delegate_)
            [(NSObject<MrViewControllerProtocol> *)delegate_ performSelectorOnMainThread:@selector(connectionOpened) withObject:nil waitUntilDone:NO];
    }

    void WebSocketHandler::on_close(websocketpp::server::connection_ptr con)
    {
        con_ = websocketpp::server::connection_ptr();
        std::cout << "WebSocket connection terminated" << std::endl;
        
        if(delegate_)
            [(NSObject<MrViewControllerProtocol> *)delegate_ performSelectorOnMainThread:@selector(connectionClosed) withObject:nil waitUntilDone:NO];
    }

    void WebSocketHandler::on_message(websocketpp::server::connection_ptr con, websocketpp::server::handler::message_ptr msg)
    {
        std::cout << "Got WebSocket message: " << msg->get_payload() << std::endl;
    }

    void WebSocketHandler::send(const std::string &msg)
    {
        if( !con_ ) {
            std::cerr << "Error: no connected session" << std::endl;
            return;
        }
        
        if( msg == "/close" ) {
            close();
        } else {
            con_->send(msg);
        }
    }

    void WebSocketHandler::send(const char *data, std::size_t size)
    {
        if( !con_ ) {
            std::cerr << "Error: no connected session" << std::endl;
            return;
        }
        
        con_->send(std::string(data, size), websocketpp::frame::opcode::BINARY);
    }

    void WebSocketHandler::send(const std::string &msg, websocketpp::frame::opcode::value op)
    {
        if( !con_ ) {
            std::cerr << "Error: no connected session" << std::endl;
            return;
        }
        
        con_->send(msg, op);
    }

    void WebSocketHandler::close()
    {
        if( !con_ ) {
            std::cerr << "Error: no connected session" << std::endl;
            return;
        }
        con_->close(websocketpp::close::status::GOING_AWAY,"");
    }
}