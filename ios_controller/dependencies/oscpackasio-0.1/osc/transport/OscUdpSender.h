//
//  OscUdpSender.h
//  Hydrogen_OscIosSender
//
//  Created by Rick Boykin on 11/26/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __Hydrogen__OscUdpSender__
#define __Hydrogen__OscUdpSender__

#include <ctime>
#include <iostream>
#include <string>
#include <boost/bind.hpp>
#include <boost/asio.hpp>
#import "OscOutboundPacketStream.h"

namespace osc
{
    namespace transport
    {
        namespace udp
        {
            class Sender
            {
            public:
                Sender(boost::asio::io_service& io_service, const boost::asio::ip::address &address, unsigned short port)
                : socket_(io_service),
                remote_endpoint_(address, port)
                {
                    socket_.open(boost::asio::ip::udp::v4());
                }
                
                void handle_send(const boost::system::error_code& error, std::size_t bytes_transferred)
                {
                    std::cout << "async_send_to return " << error << ": " << bytes_transferred << " transmitted" << std::endl;
                    // nada
                }
                
                void send(const char *data, std::size_t size)
                {
                    socket_.async_send_to(boost::asio::buffer(data, size), remote_endpoint_,
                                          boost::bind(&Sender::handle_send,
                                                      this,
                                                      boost::asio::placeholders::error,
                                                      boost::asio::placeholders::bytes_transferred));
                }

            private:
                
                boost::asio::ip::udp::socket socket_;
                boost::asio::ip::udp::endpoint remote_endpoint_;
            };
        }
    }
}

#endif /* defined(__Hydrogen__OscUdpSender__) */
