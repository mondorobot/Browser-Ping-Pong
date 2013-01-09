//
//  OscTcpReceiver.h
//  Hydrogen_OscIosSender
//
//  Created by Rick Boykin on 11/27/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __Hydrogen_OscIosSender__OscTcpReceiver__
#define __Hydrogen_OscIosSender__OscTcpReceiver__

#include <algorithm>
#include <cstdlib>
#include <deque>
#include <iostream>
#include <set>
#include <boost/bind.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/enable_shared_from_this.hpp>
#include <boost/asio/deadline_timer.hpp>
#include <boost/asio/io_service.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/asio/ip/udp.hpp>
#include <boost/asio/read_until.hpp>
#include <boost/asio/streambuf.hpp>
#include <boost/asio/write.hpp>

#include "OscPacketListener.h"
#include "OscTcpData.h"
#include "OscUtils.h"

#define OSC_TRANSPORT_TCP_INPUT_TIMEOUT 30
#define OSC_TRANSPORT_TCP_OUTPUT_TIMEOUT 0

namespace osc
{
    namespace transport
    {
        namespace tcp
        {
            //
            // server.cpp
            // ~~~~~~~~~~
            //
            // Copyright (c) 2003-2012 Christopher M. Kohlhoff (chris at kohlhoff dot com)
            //
            // Distributed under the Boost Software License, Version 1.0. (See accompanying
            // file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
            //

            using boost::asio::deadline_timer;
            using boost::asio::ip::tcp;
            using boost::asio::ip::udp;
            
            //----------------------------------------------------------------------
            
            class subscriber
            {
            public:
                virtual ~subscriber() { std::cout << "subscriber\n"; }
                virtual void deliver(const char *data, std::size_t size) = 0;
            };
            
            typedef boost::shared_ptr<subscriber> subscriber_ptr;
            
            //----------------------------------------------------------------------
            
            class channel
            {
            public:
                
                virtual ~channel() { std::cout << "channel\n"; }
                
                void join(subscriber_ptr subscriber)
                {
                    subscribers_.insert(subscriber);
                }
                
                void leave(subscriber_ptr subscriber)
                {
                    subscribers_.erase(subscriber);
                }
                
                void deliver(const char *data, std::size_t size)
                {
                    std::for_each(subscribers_.begin(), subscribers_.end(),
                                  boost::bind(&subscriber::deliver, _1, boost::ref(data), boost::ref(size)));
                }
                
            private:
                std::set<subscriber_ptr> subscribers_;
            };
            
            //----------------------------------------------------------------------
            
            //
            // This class manages socket timeouts by applying the concept of a deadline.
            // Some asynchronous operations are given deadlines by which they must complete.
            // Deadlines are enforced by two "actors" that persist for the lifetime of the
            // session object, one for input and one for output:
            //
            //  +----------------+                     +----------------+
            //  |                |                     |                |
            //  | check_deadline |<---+                | check_deadline |<---+
            //  |                |    | async_wait()   |                |    | async_wait()
            //  +----------------+    |  on input      +----------------+    |  on output
            //              |         |  deadline                  |         |  deadline
            //              +---------+                            +---------+
            //
            // If either deadline actor determines that the corresponding deadline has
            // expired, the socket is closed and any outstanding operations are cancelled.
            //
            // The input actor reads messages from the socket, where messages are delimited
            // by the newline character:
            //
            //  +------------+
            //  |            |
            //  | start_read |<---+
            //  |            |    |
            //  +------------+    |
            //          |         |
            //  async_- |    +-------------+
            //   read_- |    |             |
            //  until() +--->| handle_read |
            //               |             |
            //               +-------------+
            //
            // The deadline for receiving a complete message is 30 seconds. If a non-empty
            // message is received, it is delivered to all subscribers. If a heartbeat (a
            // message that consists of a single newline character) is received, a heartbeat
            // is enqueued for the client, provided there are no other messages waiting to
            // be sent.
            //
            // The output actor is responsible for sending messages to the client:
            //
            //  +--------------+
            //  |              |<---------------------+
            //  | await_output |                      |
            //  |              |<---+                 |
            //  +--------------+    |                 |
            //      |      |        | async_wait()    |
            //      |      +--------+                 |
            //      V                                 |
            //  +-------------+               +--------------+
            //  |             | async_write() |              |
            //  | start_write |-------------->| handle_write |
            //  |             |               |              |
            //  +-------------+               +--------------+
            //
            // The output actor first waits for an output message to be enqueued. It does
            // this by using a deadline_timer as an asynchronous condition variable. The
            // deadline_timer will be signalled whenever the output queue is non-empty.
            //
            // Once a message is available, it is sent to the client. The deadline for
            // sending a complete message is 30 seconds. After the message is successfully
            // sent, the output actor again waits for the output queue to become non-empty.
            //
            class Session
            : public subscriber,
            public boost::enable_shared_from_this<Session>
            {
            public:
                Session(boost::asio::io_service& io_service, channel& ch, PacketListener<boost::asio::ip::tcp> *listener)
                : channel_(ch),
                socket_(io_service),
                input_deadline_(io_service),
                non_empty_output_queue_(io_service),
                output_deadline_(io_service),
                handler_(listener),
                input_timeout_(OSC_TRANSPORT_TCP_INPUT_TIMEOUT),
                output_timeout_(OSC_TRANSPORT_TCP_OUTPUT_TIMEOUT)
                {
                    input_deadline_.expires_at(boost::posix_time::pos_infin);
                    output_deadline_.expires_at(boost::posix_time::pos_infin);
                    
                    // The non_empty_output_queue_ deadline_timer is set to pos_infin whenever
                    // the output queue is empty. This ensures that the output actor stays
                    // asleep until a message is put into the queue.
                    non_empty_output_queue_.expires_at(boost::posix_time::pos_infin);
                }
                
                ~Session() { std::cout << "~Session\n"; }
                    
                tcp::socket& socket()
                {
                    return socket_;
                }
                
                // Called by the server object to initiate the four actors.
                void start()
                {
                    std::cout << "Session start\n"; 
                    channel_.join(shared_from_this());
                    
                    start_read();
                    
                    input_deadline_.async_wait(
                                               boost::bind(&Session::check_deadline,
                                                           shared_from_this(), &input_deadline_));
                    
                    await_output();
                    
                    output_deadline_.async_wait(
                                                boost::bind(&Session::check_deadline,
                                                            shared_from_this(), &output_deadline_));
                }
                
                long get_input_timeout() { return input_timeout_; }
                void set_input_timeout(long value) { input_timeout_ = value; }
                
                long get_output_timeout() { return output_timeout_; }
                void set_output_timeout(long value) { output_timeout_ = value; }
                
            private:
                void stop()
                {
                    std::cout << "Session stop\n"; 
                    channel_.leave(shared_from_this());
                    
                    boost::system::error_code ignored_ec;
                    socket_.close(ignored_ec);
                    input_deadline_.cancel();
                    non_empty_output_queue_.cancel();
                    output_deadline_.cancel();
                }
                
                bool stopped() const
                {
                    return !socket_.is_open();
                }
                
                void deliver(const char *data, std::size_t size)
                {
                    std::cout << "delivered" << size << " bytes.\n";
                    
                    // output_queue_.push_back(boost::asio::const_buffer((const void *)data, size));
                    
                    // Signal that the output queue contains messages. Modifying the expiry
                    // will wake the output actor, if it is waiting on the timer.
                    // non_empty_output_queue_.expires_at(boost::posix_time::neg_infin);
                }
                
                void start_read()
                {
                    std::cout << "start read: \n";
                    // Set a deadline for the read operation.
                    if(input_timeout_ > 0)
                        input_deadline_.expires_from_now(boost::posix_time::seconds(input_timeout_));
                    else
                        input_deadline_.expires_at(boost::posix_time::pos_infin);
                    
                    boost::asio::async_read(socket_,
                                            boost::asio::buffer(input_buffer_, BUFFER_SIZE),
                                            boost::bind(&Session::completion_condition, this,
                                                        boost::asio::placeholders::error,
                                                        boost::asio::placeholders::bytes_transferred),
                                            boost::bind(&Session::handle_read, this,
                                                        boost::asio::placeholders::error,
                                                        boost::asio::placeholders::bytes_transferred));
                }
                
                void handle_read(const boost::system::error_code& error,
                                 std::size_t bytes_transferred)
                {
                    if (stopped())
                        return;
                    
                    std::cout << "bytes read: " << bytes_transferred << "\n";
                    if (!error)
                    {
                        if (bytes_transferred == 4 && IsHeartbeatSig(input_buffer_))
                        {
                            boost::asio::ip::tcp::endpoint remote_endpoint = socket_.remote_endpoint();
                            std::cout << "ping: " << remote_endpoint.address() << ":" << remote_endpoint.port() << " size: " << bytes_transferred << "\n";
                            // We received a heartbeat message from the client. If there's nothing
                            // else being sent or ready to be sent, send a heartbeat right back.
                            if (output_queue_.empty())
                            {
                                output_queue_.push_back(boost::asio::const_buffer(static_cast<const void *>(osc::transport::tcp::HeartbeatSig),
                                                                                  sizeof(osc::transport::tcp::HeartbeatSig)));
                                
                                // Signal that the output queue contains messages. Modifying the
                                // expiry will wake the output actor, if it is waiting on the timer.
                                non_empty_output_queue_.expires_at(boost::posix_time::neg_infin);
                            }
                            
                        }
                        else if(bytes_transferred > 4)
                        {
                            boost::asio::ip::tcp::endpoint remote_endpoint = socket_.remote_endpoint();
                            if(handler_.get())
                                handler_->ProcessPacket(input_buffer_ + 4, (int)bytes_transferred - 4, remote_endpoint);
                            std::cout << remote_endpoint.address() << ":" << remote_endpoint.port() << " size: " << bytes_transferred << "\n";
                            //channel_.deliver(input_buffer_.data(), bytes_transferred);
                        }
                    
                        waiting_for_ = UNKNOWN;
                        start_read();
                    }
                    else
                    {
                        std::cout << "Error: handle_read:" << error.message() << "\n";
                        stop();
                    }
                }
                
                std::size_t completion_condition(const boost::system::error_code& error, size_t bytes_transferred)
                {
                    std::size_t ret = 0;
                    
                    if (!error)
                    {
                        std::cout << "completion_condition for data type: " << waiting_for_ << " bytes_transferred: " << bytes_transferred << "\n";
                        if (bytes_transferred == 4 && IsHeartbeatSig(input_buffer_))
                        {
                            waiting_for_ = UNKNOWN;
                            ret = 0;
                        }
                        else if(waiting_for_ == UNKNOWN)
                        {
                            waiting_for_ = SIZE;
                            ret = 4;
                        }
                        else if(waiting_for_ == SIZE)
                        {
                            if(bytes_transferred == 4)
                            {
                                int32 dataSize = ToInt32(input_buffer_);
                                if(dataSize > 0)
                                {
                                    waiting_for_ = DATA;
                                    ret = dataSize - 4; // sub 4 for 4 byte size.
                                    
                                }
                                else
                                {
                                    waiting_for_ = UNKNOWN;
                                }
                            }
                        }
                        else if(waiting_for_ == DATA)
                        {
                            waiting_for_ = UNKNOWN;
                        }
                    }
                    else
                    {
                        std::cout << "Error: completion_condition" << error.message() << "\n";
                    }
                    std::cout << "waiting for data type: " << waiting_for_ << " size: " << ret << "\n\n";
                    return ret;
                }
                
                void await_output()
                {
                    if (stopped())
                        return;
                    
                    if (output_queue_.empty())
                    {
                        // There are no messages that are ready to be sent. The actor goes to
                        // sleep by waiting on the non_empty_output_queue_ timer. When a new
                        // message is added, the timer will be modified and the actor will wake.
                        non_empty_output_queue_.expires_at(boost::posix_time::pos_infin);
                        non_empty_output_queue_.async_wait(boost::bind(&Session::await_output, shared_from_this()));
                    }
                    else
                    {
                        start_write();
                    }
                }
                
                void start_write()
                {
                    // Set a deadline for the write operation.
                    if(output_timeout_ > 0)
                        output_deadline_.expires_from_now(boost::posix_time::seconds(output_timeout_));
                    else
                        output_deadline_.expires_at(boost::posix_time::pos_infin);
                    
                    // Start an asynchronous operation to send a message.
                    boost::asio::async_write(socket_,
                                             boost::asio::buffer(output_queue_.front()),
                                             boost::bind(&Session::handle_write, shared_from_this(), _1));
                }
                
                void handle_write(const boost::system::error_code& error)
                {
                    if (stopped())
                        return;
                    
                    if (!error)
                    {
                        output_queue_.pop_front();
                        
                        await_output();
                    }
                    else
                    {
                        std::cout << "Error: handle_read:" << error.message() << "\n";
                        stop();
                    }
                }
                
                void check_deadline(deadline_timer* deadline)
                {
                    if (stopped())
                        return;
                    
                    // Check whether the deadline has passed. We compare the deadline against
                    // the current time since a new asynchronous operation may have moved the
                    // deadline before this actor had a chance to run.
                    if (deadline->expires_at() <= deadline_timer::traits_type::now())
                    {
                        // The deadline has passed. Stop the session. The other actors will
                        // terminate as soon as possible.
                        std::cout << "Warning: deadline expired.\n";
                        stop();
                    }
                    else
                    {
                        // Put the actor back to sleep.
                        deadline->async_wait(
                                             boost::bind(&Session::check_deadline,
                                                         shared_from_this(), deadline));
                    }
                }
                
                channel& channel_;
                tcp::socket socket_;
                enum { BUFFER_SIZE = 1024 };
                char input_buffer_[BUFFER_SIZE];
                enum { UNKNOWN, SIZE, DATA };
                short waiting_for_ = UNKNOWN;
                deadline_timer input_deadline_;
                std::deque<boost::asio::const_buffer> output_queue_;
                deadline_timer non_empty_output_queue_;
                deadline_timer output_deadline_;
                
                std::shared_ptr<PacketListener<boost::asio::ip::tcp>> handler_;
                long input_timeout_;
                long output_timeout_;
                
            };
            
            typedef boost::shared_ptr<Session> tcp_session_ptr;
            
            //----------------------------------------------------------------------
            
            class Receiver
            {
            public:
                Receiver(boost::asio::io_service& io_service,
                       const tcp::endpoint& listen_endpoint,
                       PacketListener<boost::asio::ip::tcp> *listener)
                : io_service_(io_service),
                acceptor_(io_service, listen_endpoint),
                handler_(listener)
                {
                    start_accept();
                }
                
                ~Receiver() { std::cout << "~Receiver\n"; }
                
                void start_accept()
                {
                    tcp_session_ptr new_session(new Session(io_service_, channel_, handler_.get()));
                    
                    std::cout << "Accepting connection on: " << acceptor_.local_endpoint() << "\n";
                    
                    acceptor_.async_accept(new_session->socket(),
                                           boost::bind(&Receiver::handle_accept, this, new_session, _1));
                }
                
                void handle_accept(tcp_session_ptr session,
                                   const boost::system::error_code& error)
                {
                    std::cout << "Connection accepted on " << acceptor_.local_endpoint() << "\n";
                    if (!error)
                    {
                        session->start();
                    }
                    else
                    {
                        std::cout << "Error accepting connection on: " << acceptor_.local_endpoint() << " error: " << error.message() << "\n";
                    }
                    
                    start_accept();
                }
                
            private:
                boost::asio::io_service& io_service_;
                tcp::acceptor acceptor_;
                channel channel_;
                
                std::shared_ptr<PacketListener<boost::asio::ip::tcp>> handler_;
            };
        }
    }
}


#endif /* defined(__Hydrogen_OscIosSender__OscTcpReceiver__) */
