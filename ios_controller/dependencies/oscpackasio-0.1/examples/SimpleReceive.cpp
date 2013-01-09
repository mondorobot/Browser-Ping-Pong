/* 
    Example of two different ways to process received OSC messages using oscpack.
    Receives the messages from the SimpleSend.cpp example.
*/

#include <iostream>

#include <boost/thread.hpp>
#include "osc/OscReceivedElements.h"
#include "osc/OscPacketListener.h"
#include "osc/OscTypes.h"
#include "osc/transport/OscUdpReceiver.h"

#define PORT 7000


class ExamplePacketListener : public osc::OscPacketListener<boost::asio::ip::udp> {
protected:

    virtual void ProcessMessage( const osc::ReceivedMessage& m, 
				const boost::asio::ip::basic_endpoint<boost::asio::ip::udp>& remoteEndpoint )
    {
        try{
            // example of parsing single messages. osc::OsckPacketListener
            // handles the bundle traversal.
            
            if( strcmp( m.AddressPattern(), "/test1" ) == 0 ){
                // example #1 -- argument stream interface
                osc::ReceivedMessageArgumentStream args = m.ArgumentStream();
                bool a1;
                osc::int32 a2;
                float a3;
                const char *a4;
                args >> a1 >> a2 >> a3 >> a4 >> osc::EndMessage;
                
                std::cout << "received '/test1' message with arguments: "
                    << a1 << " " << a2 << " " << a3 << " " << a4 << "\n";
                
            }else if( strcmp( m.AddressPattern(), "/test2" ) == 0 ){
                // example #2 -- argument iterator interface, supports
                // reflection for overloaded messages (eg you can call 
                // (*arg)->IsBool() to check if a bool was passed etc).
                osc::ReceivedMessage::const_iterator arg = m.ArgumentsBegin();
                bool a1 = (arg++)->AsBool();
                int a2 = (arg++)->AsInt32();
                float a3 = (arg++)->AsFloat();
                const char *a4 = (arg++)->AsString();
                if( arg != m.ArgumentsEnd() )
                    throw osc::ExcessArgumentException();
                
                std::cout << "received '/test2' message with arguments: "
                    << a1 << " " << a2 << " " << a3 << " " << a4 << "\n";
            }
        }catch( osc::Exception& e ){
            // any parsing errors such as unexpected argument types, or 
            // missing arguments get thrown as exceptions.
            std::cout << "error while parsing message: "
                << m.AddressPattern() << ": " << e.what() << "\n";
        }
    }
};

static boost::asio::io_service io_service;

static void RunDump()
{
    ExamplePacketListener listener;
    boost::asio::ip::udp::endpoint listen_endpoint(boost::asio::ip::udp::v4(), PORT);
    osc::transport::udp::Receiver receiver(io_service, listen_endpoint, &listener);
    
	std::cout << "listening for input on port " << PORT << "...\n";
	std::cout << "press ctrl-c to end\n";
    
	new boost::thread(boost::bind(&boost::asio::io_service::run, &io_service));
    
	std::cout << "finishing.\n";
}

#ifndef NO_OSC_TEST_MAIN

int main(int argc, char* argv[])
{
    RunDump();

    return 0;
}

#endif
