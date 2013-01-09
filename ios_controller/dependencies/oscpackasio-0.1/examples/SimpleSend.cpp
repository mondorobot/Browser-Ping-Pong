/* 
    Simple example of sending an OSC message using oscpack.
*/

#import <boost/thread.hpp>
#include "osc/OscOutboundPacketStream.h"
#include "osc/transport/OscUdpSender.h"

#define ADDRESS "127.0.0.1"
#define PORT 7000

#define OUTPUT_BUFFER_SIZE 1024

static void RunSimpleSend()
{
    char buffer[OUTPUT_BUFFER_SIZE];
    osc::OutboundPacketStream p( buffer, OUTPUT_BUFFER_SIZE );
    
    boost::asio::io_service io_service;
    boost::asio::ip::address_v4::from_string(ADDRESS);
    
    std::cout << "sending test messages to " << ADDRESS << ") on port " << PORT << "...\n";
    
    osc::transport::udp::Sender sender(io_service, boost::asio::ip::address_v4::from_string(ADDRESS), PORT);
    
    p << osc::BeginBundleImmediate
    << osc::BeginMessage( "/test1" )
    << true << 23 << (float)3.1415 << "hello" << osc::EndMessage
    << osc::BeginMessage( "/test2" )
    << true << 24 << (float)10.8 << "world" << osc::EndMessage
    << osc::EndBundle;
    
    sender.send( p.Data(), p.Size() );
}

#ifndef NO_OSC_TEST_MAIN

int main(int argc, char* argv[])
{
    RunSimpleSend();
}

#endif