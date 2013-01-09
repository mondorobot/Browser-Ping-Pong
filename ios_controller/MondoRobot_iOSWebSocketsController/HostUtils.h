//
//  HostUtils.h
//  MondoRobot_iOSWebSocketsController
//
//  Created by Rick Boykin on 12/19/12.
//  Copyright (c) 2012 Rick Boykin. All rights reserved.
//

#ifndef __MondoRobot_iOSWebSocketsController__HostUtils__
#define __MondoRobot_iOSWebSocketsController__HostUtils__

#include <iostream>

namespace mr
{
    class HostUtils
    {
    public:
        
        static std::string getLocalIpAddress();
    };
}

#endif /* defined(__MondoRobot_iOSWebSocketsController__HostUtils__) */
