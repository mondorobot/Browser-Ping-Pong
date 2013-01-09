//
//  HostUtils.cpp
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/19/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#include "HostUtils.h"

#include <sys/socket.h>
#include <netinet/in.h>
#import <ifaddrs.h>
#import <arpa/inet.h>

namespace mr
{
    std::string HostUtils::getLocalIpAddress()
    {
        std::string address("error");
        struct ifaddrs *interfaces = NULL;
        struct ifaddrs *temp_addr = NULL;
        // retrieve the current interfaces - returns 0 on success
        int success = getifaddrs(&interfaces);
        if (success == 0) {
            // Loop through linked list of interfaces
            temp_addr = interfaces;
            while(temp_addr != NULL) {
                if(temp_addr->ifa_addr->sa_family == AF_INET) {
                    // Check if interface is en0 which is the wifi connection on the iPhone
                    if(!strcmp(temp_addr->ifa_name, "en0")) {
                        // Get NSString from C String
                        address = inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr);
                    }
                }
                temp_addr = temp_addr->ifa_next;
            }
        }
        // Free memory
        freeifaddrs(interfaces);
        return address;
    }
}