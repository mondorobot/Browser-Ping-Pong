//
//  OscTcpSender.h
//  Hydrogen_OscOsxReceiver
//
//  Created by Rick Boykin on 11/28/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __Hydrogen_OscOsxReceiver__OscTcpSender__
#define __Hydrogen_OscOsxReceiver__OscTcpSender__

#include <boost/asio/deadline_timer.hpp>
#include <boost/asio/io_service.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/read_until.hpp>
#include <boost/asio/streambuf.hpp>
#include <boost/asio/write.hpp>
#include <boost/bind.hpp>
#include <iostream>

#include "OscOutboundPacketStream.h"
#include "OscTcpData.h"

#define OSC_TRANSPORT_TCP_CONNECTION_TIMEOUT 60
#define OSC_TRANSPORT_TCP_HEARTBEAT_TIMEOUT 30
#define OSC_TRANSPORT_TCP_HEARTBEAT_INTERVAL 10

namespace osc
{
    namespace transport
    {
        namespace tcp
        {
            //
            // Sender.h
            // ~~~~~~~~~~~~~~~~~~~~
            //
            // Copyright (c) 2003-2012 Christopher M. Kohlhoff (chris at kohlhoff dot com)
            //
            // Distributed under the Boost Software License, Version 1.0. (See accompanying
            // file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
            //

            using boost::asio::deadline_timer;
            using boost::asio::ip::tcp;
            
            //
            // This class manages socket timeouts by applying the concept of a deadline.
            // Some asynchronous operations are given deadlines by which they must complete.
            // Deadlines are enforced by an "actor" that persists for the lifetime of the
            // client object:
            //
            //  +----------------+
            //  |                |
            //  | check_deadline |<---+
            //  |                |    |
            //  +----------------+    | async_wait()
            //              |         |
            //              +---------+
            //
            // If the deadline actor determines that the deadline has expired, the socket
            // is closed and any outstanding operations are consequently cancelled.
            //
            // Connection establishment involves trying each endpoint in turn until a
            // connection is successful, or the available endpoints are exhausted. If the
            // deadline actor closes the socket, the connect actor is woken up and moves to
            // the next endpoint.
            //
            //  +---------------+
            //  |               |
            //  | start_connect |<---+
            //  |               |    |
            //  +---------------+    |
            //           |           |
            //  async_-  |    +----------------+
            // connect() |    |                |
            //           +--->| handle_connect |
            //                |                |
            //                +----------------+
            //                          :
            // Once a connection is     :
            // made, the connect        :
            // actor forks in two -     :
            //                          :
            // an actor for reading     :       and an actor for
            // inbound messages:        :       sending heartbeats:
            //                          :
            //  +------------+          :          +-------------+
            //  |            |<- - - - -+- - - - ->|             |
            //  | start_read |                     | start_write |<---+
            //  |            |<---+                |             |    |
            //  +------------+    |                +-------------+    | async_wait()
            //          |         |                        |          |
            //  async_- |    +-------------+       async_- |    +--------------+
            //   read_- |    |             |       write() |    |              |
            //  until() +--->| handle_read |               +--->| handle_write |
            //               |             |                    |              |
            //               +-------------+                    +--------------+
            //
            // The input actor reads messages from the socket, where messages are delimited
            // by the newline character. The deadline for a complete message is 30 seconds.
            //
            // The heartbeat actor sends a heartbeat (a message that consists of a single
            // newline character) every 10 seconds. In this example, no deadline is applied
            // message sending.
            //
            class Sender
            {
            public:
                Sender(boost::asio::io_service& io_service)
                : stopped_(false),
                socket_(io_service),
                deadline_(io_service),
                heartbeat_timer_(io_service),
                connection_timeout_(OSC_TRANSPORT_TCP_CONNECTION_TIMEOUT),
                heartbeat_timeout_(OSC_TRANSPORT_TCP_HEARTBEAT_TIMEOUT),
                heartbeat_interval_(OSC_TRANSPORT_TCP_HEARTBEAT_INTERVAL)
                {
                    //boost::asio::ip::tcp::no_delay option(true);
                    //socket_.set_option(option);
                }
                
                // Called by the user of the client class to initiate the connection process.
                // The endpoint iterator will have been obtained using a tcp::resolver.
                void start(tcp::endpoint endpoint)
                {
                    // Start the connect actor.
                    start_connect(endpoint);
                    
                    // Start the deadline actor. You will note that we're not setting any
                    // particular deadline here. Instead, the connect and input actors will
                    // update the deadline prior to each asynchronous operation.
                    deadline_.async_wait(boost::bind(&Sender::check_deadline, this, _1));
                }
                
                // This function terminates all the actors to shut down the connection. It
                // may be called by the user of the client class, or by the class itself in
                // response to graceful termination or an unrecoverable error.
                void stop()
                {
                    stopped_ = true;
                    boost::system::error_code ignored_ec;
                    socket_.close(ignored_ec);
                    deadline_.cancel();
                    heartbeat_timer_.cancel();
                }
                
                void send(const char *data, std::size_t size)
                {
                    if (stopped_)
                        return;
                    
                    // Start an asynchronous operation to send a heartbeat message.
                    boost::asio::async_write(socket_, boost::asio::buffer(data, size),
                                             boost::bind(&Sender::handle_write, this, _1));
                }
                
                void set_connection_timeout(long value) { connection_timeout_ = value; }
                long get_connection_timeout() { return connection_timeout_; }
                
                void set_heartbeat_timeout(long value) { heartbeat_timeout_ = value; }
                long get_heartbeat_timeout() { return heartbeat_timeout_; }
                
                void set_heartbeat_interval(long value) { heartbeat_interval_ = value; }
                long get_heartbeat_interval() { return heartbeat_interval_; }
                
            private:
                void start_connect(tcp::endpoint endpoint)
                {
                    // Set a deadline for the connect operation.
                    if(connection_timeout_ > 0)
                        deadline_.expires_from_now(boost::posix_time::seconds(connection_timeout_));
                    else
                        deadline_.expires_at(boost::posix_time::pos_infin);
                    
                    // Start the asynchronous connect operation.
                    socket_.async_connect(endpoint,
                                          boost::bind(&Sender::handle_connect,
                                                      this, _1, endpoint));
                }
                
                void handle_connect(const boost::system::error_code& error,
                                    tcp::endpoint endpoint)
                {
                    if (stopped_)
                        return;
                    
                    
                    
                    // The async_connect() function automatically opens the socket at the start
                    // of the asynchronous operation. If the socket is closed at this time then
                    // the timeout handler must have run first.
                    if (!socket_.is_open())
                    {
                        std::cout << "Connect timed out\n";
                        
                        // Try the next available endpoint.
                        start_connect(endpoint);
                    }
                    
                    // Check if the connect operation failed before the deadline expired.
                    else if (error)
                    {
                        std::cout << "Connect error: " << error.message() << "\n";
                        
                        // We need to close the socket used in the previous connection attempt
                        // before starting a new one.
                        socket_.close();
                    }
                    
                    // Otherwise we have successfully established a connection.
                    else
                    {
                        std::cout << "Connected to " << endpoint << "\n";
                        
                        deadline_.expires_at(boost::posix_time::pos_infin);
                        
                        // Start the input actor.
                        start_read();
                        
                        // Start the heartbeat actor.
                        boost::system::error_code ignored_error;
                        start_write_heartbeat(ignored_error);
                    }
                }
                
                void start_read()
                {
                    // Set a deadline for the read operation.
                    //deadline_.expires_from_now(boost::posix_time::seconds(30));
                    // Do not expire on read as we do more writing than reading.
                    // TODO: expire on reading when we re expecting a ping return.
                    
                    
                    // Start an asynchronous operation to read a newline-delimited message.
                    boost::asio::async_read_until(socket_, input_buffer_, std::string(osc::transport::tcp::HeartbeatSig, sizeof(osc::transport::tcp::HeartbeatSig)),
                                                  boost::bind(&Sender::handle_read, this, _1));
                }
                
                void handle_read(const boost::system::error_code& error)
                {
                    if (stopped_)
                        return;
                    
                    if (!error)
                    {
                        // Empty messages are heartbeats and so ignored.
                        if (input_buffer_.size() == 4)
                        {
                            const char *data = boost::asio::buffer_cast<const char*>( input_buffer_.data() );
                            if(osc::transport::tcp::IsHeartbeatSig(data))
                                std::cout << "Received: heartbeat\n";
                        }
                        
                        input_buffer_.consume(input_buffer_.size());

                        start_read();
                    }
                    else
                    {
                        std::cout << "Error on receive: " << error.message() << "\n";
                        
                        stop();
                    }
                }
                
                void handle_write(const boost::system::error_code& error)
                {
                    if (stopped_)
                        return;
                    
                    if (!error)
                    {
                        // Wait 10 seconds before sending the next heartbeat. Since we may call this while we are
                        // waiting (for example when we send some non-heartbeat data) we may see
                        // operation aborted errors. Those are expected.
                        if(heartbeat_interval_ > 0)
                        {
                            heartbeat_timer_.expires_from_now(boost::posix_time::seconds(heartbeat_interval_));
                            heartbeat_timer_.async_wait(boost::bind(&Sender::start_write_heartbeat, this, _1));
                        }
                        else
                        {
                            heartbeat_timer_.expires_at(boost::posix_time::pos_infin);
                        }
                    }
                    else if(error == boost::asio::error::operation_aborted)
                    {
                        // This should not happen since we do not wait on a reply from messages. Tcp takes
                        // care of that.
                        std::cout << "Write interrupted: " << error.message() << "\n";
                    }
                    else
                    {
                        std::cout << "Error on write: " << error.message() << "\n";
                        
                        stop();
                    }
                }
                
                void start_write_heartbeat(const boost::system::error_code& error)
                {
                    if (stopped_)
                        return;
                    
                    if(!error)
                    {
                        if(heartbeat_timeout_ > 0)
                            deadline_.expires_from_now(boost::posix_time::seconds(heartbeat_timeout_));
                        else
                            deadline_.expires_at(boost::posix_time::pos_infin);
                        
                        // Start an asynchronous operation to send a heartbeat message.
                        boost::asio::async_write(socket_, boost::asio::buffer(osc::transport::tcp::HeartbeatSig, 4),
                                                 boost::bind(&Sender::handle_write_heartbeat, this, _1));
                        
                    }
                    else if(error == boost::asio::error::operation_aborted)
                    {
                        std::cout << "Heartbeat interrupted: " << error.message() << "\n";
                    }
                    else
                    {
                        std::cout << "Error on heartbeat: " << error.message() << "\n";
                        
                        stop();
                    }
                }
                
                void handle_write_heartbeat(const boost::system::error_code& error)
                {
                    if (stopped_)
                        return;
                    
                    if (!error)
                    {
                        deadline_.expires_at(boost::posix_time::pos_infin);
                        // Wait 10 seconds before sending the next heartbeat.
                        if(heartbeat_interval_ > 0)
                        {
                            heartbeat_timer_.expires_from_now(boost::posix_time::seconds(heartbeat_interval_));
                            heartbeat_timer_.async_wait(boost::bind(&Sender::start_write_heartbeat, this, _1));
                        }
                        else
                        {
                            heartbeat_timer_.expires_at(boost::posix_time::pos_infin);
                        }
                    }
                    else if(error != boost::asio::error::operation_aborted)
                    {
                        std::cout << "Heartbeat interrupted: " << error.message() << "\n";
                    }
                    else
                    {
                        std::cout << "Error on heartbeat: " << error.message() << "\n";
                        
                        stop();
                    }
                }
                
                void check_deadline(const boost::system::error_code& error)
                {
                    if (stopped_)
                        return;
                    
                    // Check whether the deadline has passed. We compare the deadline against
                    // the current time since a new asynchronous operation may have moved the
                    // deadline before this actor had a chance to run.
                    if (deadline_.expires_at() <= deadline_timer::traits_type::now())
                    {
                        std::cout << "Receiver deadline expired: \n";
                        // The deadline has passed. The socket is closed so that any outstanding
                        // asynchronous operations are cancelled.
                        socket_.close();
                        
                        // There is no longer an active deadline. The expiry is set to positive
                        // infinity so that the actor takes no action until a new deadline is set.
                        deadline_.expires_at(boost::posix_time::pos_infin);
                    }
                    
                    // Put the actor back to sleep.
                    deadline_.async_wait(boost::bind(&Sender::check_deadline, this, _1));
                }
                
            private:
                bool stopped_;
                tcp::socket socket_;
                boost::asio::streambuf input_buffer_;
                // Deadline for connecting and receiving a response from heartbeats.
                deadline_timer deadline_;
                // Timer to fire off heartbeats.
                deadline_timer heartbeat_timer_;
                // Connection Timeout
                long connection_timeout_;
                // Heartbeat timeout
                long heartbeat_timeout_;
                // Heartbeat Interval
                long heartbeat_interval_;
            };
        }
    }
}

#endif /* defined(__Hydrogen_OscOsxReceiver__OscTcpSender__) */
