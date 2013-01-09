//
//  OscUdpReceiver.h
//  Hydrogen_OscUdpReceiver
//
//  Created by Rick Boykin on 11/21/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __Hydrogen__OscUdpReceiver__
#define __Hydrogen__OscUdpReceiver__

#include <ctime>
#include <iostream>
#include <string>
#include <boost/array.hpp>
#include <boost/bind.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/asio.hpp>
#include "OscPacketListener.h"

namespace osc
{
    namespace transport
    {
        namespace udp
        {
            class Receiver
            {
            public:
                Receiver(boost::asio::io_service& io_service,
                         const boost::asio::ip::udp::endpoint& listen_endpoint,
                         PacketListener<boost::asio::ip::udp> *listener)
                : socket_(io_service, listen_endpoint), handler_(listener)
                {
                    start_receive();
                }
                
            private:
                void start_receive()
                {
                    socket_.async_receive_from(
                                               boost::asio::buffer(recv_buffer_), remote_endpoint_,
                                               boost::bind(&Receiver::handle_receive, this,
                                                           boost::asio::placeholders::error,
                                                           boost::asio::placeholders::bytes_transferred));
                }
                
                void handle_receive(const boost::system::error_code& error,
                                    std::size_t bytes_transferred)
                {
                    if (!error || error == boost::asio::error::message_size)
                    {
                        if(handler_.get())
                            handler_->ProcessPacket(recv_buffer_.data(), (int)bytes_transferred, remote_endpoint_);
                        std::cout << remote_endpoint_.address() << ":" << remote_endpoint_.port() << " size: " << bytes_transferred << "\n";

                        start_receive();
                    }
                }
                
                void handle_send(boost::shared_ptr<std::string> /*message*/,
                                 const boost::system::error_code& /*error*/,
                                 std::size_t /*bytes_transferred*/)
                {
                }

                boost::asio::ip::udp::socket socket_;
                boost::asio::ip::udp::endpoint remote_endpoint_;
                boost::array<char, 1024> recv_buffer_;
                std::unique_ptr<PacketListener<boost::asio::ip::udp>> handler_;
            };
        }
    }
}

#endif /* defined(__Hydrogen__OscUdpReceiver__) */
